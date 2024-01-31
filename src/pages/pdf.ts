import type { APIRoute } from 'astro';
import WebSocket from "ws"
interface FormDataJSON {
    [key: string]: string | number;
}

const Actions = {
    GET: 0,
    POST: 1
}

async function formDataToJson(formData: FormData, action: number): Promise<FormDataJSON> {
    const jsonData: FormDataJSON = {};
    jsonData["action"] = action
    const formDataEntries = formData.entries();
    for (const [key, value] of formDataEntries) {
        const isFile = value instanceof File;

        if (isFile) {
            const arrayBuffer = await value.arrayBuffer();
            const byteArray = new Uint8Array(arrayBuffer);

            let base64String = '';

            for (let i = 0; i < byteArray.length; i++) {
                base64String += String.fromCharCode(byteArray[i]);
            }
            const base64 = btoa(base64String);
            jsonData[key] = base64

        } else {
            jsonData[key] = value;
        }
    }


    return jsonData;
}

const conectarWS = async (): Promise<WebSocket> => {
    return new Promise((resolve, reject) => {
        const ws: WebSocket = new WebSocket(import.meta.env.WS_URI)

        ws.addEventListener("open", (e) => {
            resolve(ws)
        })

        ws.addEventListener("error", (e) => {
            reject(e)
        })
    })
}

export const POST: APIRoute = async ({ request }) => {
    const data = await request.formData()
    const ws = await conectarWS()
    const x = await formDataToJson(data, Actions.POST)

    const connectionPromise = new Promise<Response>((resolve, reject) => {

        ws.send(JSON.stringify(x))

        ws.addEventListener("message", (e) => {
            const msg = JSON.parse(e.data as string);
            resolve(
                new Response(
                    JSON.stringify({
                        message: msg.message
                    }), {
                    status: msg.code,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
                )
            );
        });

        ws.addEventListener("error", (error) => {
            resolve(new Response(
                JSON.stringify({
                    message: error
                }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            )
            );
        });
    }).finally(() => ws.close())

    const response = await connectionPromise
    return response
}

export const GET: APIRoute = async ({ url }) => {
    try {
        let ws = await conectarWS()

        const connectionPromise = new Promise<Response>((resolve, reject) => {

            const timeoutId = setTimeout(() => {
                clearTimeout(timeoutId)
                resolve(new Response(
                    JSON.stringify({
                        message: "Timeout"
                    }), {
                    status: 404,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
                )
                );
            }, 25000);

            ws.send(JSON.stringify({
                patente: url.searchParams.get("p"),
                action: Actions.GET
            }))
            let chunks: string[] = []
            ws.addEventListener("message", (e) => {
                clearTimeout(timeoutId);
                const msg = JSON.parse(e.data as string);

                if (!msg?.data) {
                    resolve(new Response(
                        JSON.stringify({
                            message: "Not found"
                        }), {
                        status: 404,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                    )
                    );
                    return
                }

                chunks.splice(msg?.num_chunk, 0, msg?.data);


            });
            ws.addEventListener("close", () => {

                const bufferArray = chunks.map(base64String => Buffer.from(base64String, 'base64'));
                const buffer = Buffer.concat(bufferArray);

                resolve(
                    new Response(buffer, {
                        status: 200,
                        headers: {
                            'Content-Type': 'application/pdf',
                            'Content-Disposition': 'inline; filename=archivo.pdf'
                        },
                    })
                )
            })
            ws.addEventListener("error", (error) => {
                clearTimeout(timeoutId)
                resolve(new Response(
                    JSON.stringify({
                        message: error.message
                    }), {
                    status: 404,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
                )
                );
            });
        }).finally(() => {
            if (ws.readyState !== ws.CLOSED && ws.readyState !== ws.CLOSING) {
                ws.close()
            }
        })

        return (await connectionPromise)
    } catch (error) {
        return new Response(
            JSON.stringify({
                //@ts-ignore
                message: error?.message
            }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        }
        )

    }


}