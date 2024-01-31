<script>
    import CardMessage from "../message/CardMessage.svelte";

    let categoria;
    let tipo;
    let sigla = "---";
    let semestre = "---";
    let año = new Date().getFullYear();
    let numeroActividad = "";
    let archivo;

    let code = -1;
    let message = "";

    const handleFileChange = (event) => {
        archivo = event.target.files[0];
    };

    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append("categoria", categoria);
        formData.append("tipo", tipo);
        formData.append("sigla", sigla);
        formData.append("semestre", semestre);
        formData.append("año", año);
        formData.append("numeroActividad", numeroActividad);
        formData.append("data", archivo);

        const response = await fetch("/pdf", {
            method: "POST",
            body: formData,
        });

        code = response.status;
        try {
            const data = await response.json();
            message = data.message ?? `Status: ${code}`;
        } catch (err) {
            message = `Status: ${code}`;
        }
    };
</script>

<form class="grid grid-cols-1 gap-3">
    <div>
        <label for="categoria">Selecciona una categoria:</label>
        <select
            bind:value={categoria}
            name="categoria"
            class="border border-solid border-black"
        >
            <option value="INT">INT</option>
            <option value="AYU">AYU</option>
            <option value="TAR">TAR</option>
            <option value="EXA">EXA</option>
            <option value="TAL">TAL</option>
            <option value="LAB">LAB</option>
            <option value="APU">APU</option>
        </select>
    </div>
    <div>
        <label for="tipo">Selecciona el tipo:</label>
        <select
            bind:value={tipo}
            name="tipo"
            class="border border-solid border-black"
        >
            <option value="ENUN">ENUN</option>
            <option value="SOLC">SOLC</option>
        </select>
    </div>
    <div>
        <label for="sigla">Selecciona el ramo:</label>
        <select
            bind:value={sigla}
            name="sigla"
            class="border border-solid border-black"
        >
            <optgroup label="1">
                <option value="IIC1103">Intro a la progra</option>
                <option value="MAT0007">Taller para estadistica</option>
                <option value="MAT1107">Introduccion al Calculo</option>
                <option value="MAT1207"
                    >Introduccion al Algebra y Geometria</option
                >
            </optgroup>
            <optgroup label="2">
                <option value="IIC2233">Progra avanzada</option>
                <option value="IMT2200">Introducción a Ciencia de Datos</option>
                <option value="IMT2210"
                    >Álgebra Lineal para Ciencia de Datos</option
                >
                <option value="MAT1610">Cálculo I</option>
            </optgroup>
            <optgroup label="3">
                <option value="ETI195"
                    >Ética para Ciencia de Datos y Estadística</option
                >
                <option value="IIC1253">Matemáticas Discretas</option>
                <option value="IMT2220">Cálculo para Ciencia de Datos</option>
                <option value="IMT2230"
                    >Álgebra Lineal Avanzada y Modelamiento</option
                >
            </optgroup>
            <optgroup label="4">
                <option value="EYP1025">Modelos Probabilísticos</option>
                <option value="IIC2133"
                    >Estructuras de Datos y Algoritmos</option
                >
                <option value="IIC2413">Bases de Datos</option>
                <option value="IMT2250"
                    >Optimización para Ciencia de Datos</option
                >
            </optgroup>
            <optgroup label="5">
                <option value="EYP2114">Inferencia Estadística</option>
                <option value="IIC2440">Procesamiento de Datos Masivos</option>
                <option value="IIC2613">Inteligencia Artificial</option>
            </optgroup>
            <optgroup label="6">
                <option value="EYP210I">Procesos Estocásticos Aplicados</option>
                <option value="EYP230I">Análisis de Regresión</option>
                <option value="IIC2026">Visualización de Información</option>
                <option value="IIC2433">Minería de Datos</option>
            </optgroup>
            <optgroup label="7">
                <option value="EYP211I">Simulación Estocástica</option>
                <option value="EYP280I">Métodos Bayesianos</option>
                <option value="IMT2260">Teoría de Aprendizaje Automático</option
                >
            </optgroup>
            <optgroup label="8">
                <option value="IMT2270">Proyecto Final de Grado</option>
            </optgroup>
        </select>
    </div>
    <div>
        <label for="semestre">Selecciona el semestre:</label>
        <select
            bind:value={semestre}
            name="semestre"
            class="border border-solid border-black"
        >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="TAV">TAV</option>
        </select>
    </div>
    <div>
        <label for="año">Año del archivo</label>
        <input
            bind:value={año}
            type="number"
            name="año"
            min="1900"
            max="2100"
            class="border border-solid border-black"
        />
    </div>
    <div>
        <label for="numeroactivida">Numero de la actividad</label>
        <input
            bind:value={numeroActividad}
            type="number"
            name="numeroactivida"
            min="1"
            class="border border-solid border-black"
        />
    </div>
    <div>
        <input
            type="file"
            on:change={handleFileChange}
            class="border border-solid border-black"
        />
    </div>
    <div>
        <button
            type="submit"
            on:click|preventDefault={handleSubmit}
            class="border border-solid border-black">Enviar Formulario</button
        >
    </div>
</form>
<CardMessage {code} {message}></CardMessage>
