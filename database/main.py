import asyncio
import websockets
from websockets import WebSocketServerProtocol
import json
import hashlib
from dotenv import load_dotenv
import os
import gridfs
import base64
from pymongo import MongoClient, errors
from pydantic import BaseModel, ValidationError, field_validator, Field
from enum import Enum
from bson import ObjectId
import binascii

load_dotenv()

client = MongoClient(
    f"mongodb://{os.getenv('MONGO_USER')}:{os.getenv('MONGO_PASS')}@{os.getenv('MONGO_HOST')}"
)
lablicd_db = client[os.getenv("MONGO_DB_NAME")]
fs = gridfs.GridFS(lablicd_db)
pdf_collection = lablicd_db["pdfs"]
pdf_collection.create_index("hash", unique=True)
pdf_collection.create_index("patente", unique=True)


class PDFSchema(BaseModel):
    categoria: str
    tipo: str
    sigla: str
    año: int
    semestre: str
    numeroActividad: int
    archivo_id: str = None
    patente: str = None
    hash: str = None

    @field_validator("año")
    def validate_año(cls, value):
        if not (isinstance(value, int) and value > 2000):
            raise ValueError(
                "El valor de 'año' debe ser mayor a 2000 y un número entero."
            )
        return value

    @field_validator("numeroActividad")
    def validate_numero_actividad(cls, value):
        if not (isinstance(value, int) and value > 0):
            raise ValueError(
                "El valor de 'numeroActividad' debe ser mayor a 0 y un número entero."
            )
        return value

    @field_validator("semestre")
    def validate_semestre(cls, value):
        if value not in {"1", "2", "TAV"}:
            raise ValueError("El valor de 'semestre' no es válido.")
        return value

    @field_validator("categoria")
    def validate_categoria(cls, value):
        if value not in {"AYU", "INT", "TAR", "EXA", "TAL", "LAB", "APU"}:
            raise ValueError("El valor de 'categoria' no es válido.")
        return value

    @field_validator("tipo")
    def validate_tipo(cls, value):
        if value not in {"SOLC", "ENUN"}:
            raise ValueError("El valor de 'tipo' no es válido.")
        return value

    def model_dump(self, **kwargs):
        self.patente = f"{self.año}-{self.semestre}-{self.sigla}-{self.categoria}-{self.tipo}-{self.numeroActividad}"
        return super().model_dump()


class Actions(Enum):
    GET = 0
    POST = 1


async def server(websocket: WebSocketServerProtocol, path):
    while True:
        try:
            data = await websocket.recv()
        except websockets.exceptions.ConnectionClosedOK:
            await websocket.close()
            continue
        form_data: dict = json.loads(data)
        action = form_data.get("action", 0)
        if action == Actions.GET.value:
            pdf_model = pdf_collection.find_one({"patente": form_data.get("patente")})

            if pdf_model is None:
                await websocket.send(
                    json.dumps(
                        {
                            "message": "Not found",
                            "code": 404,
                        }
                    )
                )
                continue

            pdf_model = PDFSchema(**pdf_model)
            archivo = fs.get(ObjectId(pdf_model.archivo_id))
            num_chunk = 0

            with archivo as file:
                while True:
                    chunk = file.read(5 * 1024 * 1024)
                    if not chunk:
                        break
                    num_chunk = num_chunk + 1
                    base64_string = base64.b64encode(chunk).decode("utf-8")
                    await websocket.send(
                        json.dumps(
                            {
                                "message": "ok",
                                "code": 200,
                                "data": base64_string,
                                "num_chunk": num_chunk,
                            }
                        )
                    )

            await websocket.close()

        elif (
            action == Actions.POST.value and os.getenv("CAN_UPLOAD", "FALSE") == "TRUE"
        ):
            archivo = form_data.get("data", None)

            if not archivo:
                await websocket.send(
                    json.dumps({"message": "archivo empty", "code": 400})
                )
                continue

            try:
                PDFSchema(**form_data)
            except ValidationError as error:
                await websocket.send(
                    json.dumps({"message": f"ERROR: {error.errors()}", "code": 400})
                )
                return
            try:
                archivo_bytes = base64.b64decode(archivo)
            except binascii.Error as error:
                await websocket.send(
                    json.dumps({"message": f"ERROR: base64", "code": 400})
                )
                return

            uuid_hash = hashlib.sha256(archivo_bytes).hexdigest()

            archivo_id = fs.put(archivo_bytes, filename=f"{uuid_hash}.pdf")

            pdf_model = PDFSchema(
                archivo_id=str(archivo_id), hash=uuid_hash, **form_data
            )

            try:
                pdf_collection.insert_one(pdf_model.model_dump())
            except errors.DuplicateKeyError as error:
                await websocket.send(
                    json.dumps({"message": f"ERROR: {error.details}", "code": 400})
                )
            await websocket.send(
                json.dumps(
                    {"message": f"Se ha subido {pdf_model.patente}", "code": 200}
                )
            )


def main():
    asyncio.get_event_loop().run_until_complete(
        websockets.serve(server, "localhost", 2233, max_size=1_000 * 1024 * 1024)
    )
    asyncio.get_event_loop().run_forever()


if __name__ == "__main__":
    main()
