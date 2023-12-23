<script lang="ts">
    let email: string = "";
    let message: string = "";
    let code: number = -1;

    let verifycode: number;
    let code2: number = -1;
    let message2: string = "";
    let token: string = "";

    const prelogin = async () => {
        const response = await fetch("/api", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
            }),
        });
        code = response.status;
        const data = await response.json();
        if (response.status !== 200) {
            message = data.message;
            return;
        }
    };
    const realogin = async () => {
        const response = await fetch("/api", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
                verifycode: verifycode,
            }),
        });

        code2 = response.status;
        const data = await response.json();
        message2 = data?.message;

        if (!response.ok) return;

        window.location.pathname = "/";
    };
</script>

{#if code == -1}
    <div>
        <input
            class="w-full p-4 text-sm bg-gray-50 focus:outline-none border border-gray-200 rounded text-gray-600"
            type="text"
            placeholder="Email"
            bind:value={email}
        />
    </div>
    <div class="py-2">
        <button
            class="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded text-sm font-bold text-gray-50 transition duration-200"
            on:click={prelogin}
            >Login
        </button>
    </div>
{:else if code == 200}
    <div class="py-2">
        <p
            class="w-full p-4 text-sm bg-green-100 focus:outline-none border border-gray-200 rounded text-gray-600"
        >
            Hemos enviado un código de verificación a su dirección de correo
            electrónico. Por favor, ingréselo para completar el proceso de
            verificación.
        </p>
    </div>
    <div class="py-4">
        <input
            class="w-full p-4 text-sm bg-gray-50 focus:outline-none border border-gray-200 rounded text-gray-600"
            type="number"
            min="0"
            max="99999"
            bind:value={verifycode}
            placeholder="Código de Verificación"
        />
    </div>

    {#if code2 !== -1 && code2 !== 200}
        <div class="py-4">
            <p
                class="w-full p-4 text-sm bg-gray-50 focus:outline-none border border-gray-200 rounded text-gray-600"
            >
                {message2}
            </p>
        </div>
    {/if}

    <div class="py-2">
        <button
            class="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded text-sm font-bold text-gray-50 transition duration-200"
            on:click={realogin}
            >Verificar Código
        </button>
    </div>
{:else}
    <div>
        <input
            class="w-full p-4 text-sm bg-gray-50 focus:outline-none border border-gray-200 rounded text-gray-600"
            type="text"
            placeholder="Email"
            bind:value={email}
        />
    </div>
    <div class="py-4">
        <p
            class="w-full p-4 text-sm bg-gray-50 focus:outline-none border border-gray-200 rounded text-gray-600"
        >
            {message}
        </p>
    </div>
    <div class="py-2">
        <button
            class="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded text-sm font-bold text-gray-50 transition duration-200"
            on:click={prelogin}
            >Login
        </button>
    </div>
{/if}
