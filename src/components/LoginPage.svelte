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

        if (response.ok) return;

        if (response.status === 400) {
            message =
                "La dirección de correo electrónico no pertenece al dominio 'uc.cl'.";
            return;
        }

        message = data.message;
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

        if (response.status !== 400) message = data?.message;
        if (response.status === 400)
            message = "El código de verificación no consta de cinco dígitos.";
        if (response.status === 404) {
            message += " Redirigiendo a la página inicial.";
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }
        if (!response.ok) return;

        setTimeout(() => {
            window.location.reload();
        }, 750);
    };

    const handleKeyup1 = (e: KeyboardEvent) => {
        if (e.code != "Enter") return;
        prelogin();
    };
    const handleKeyup2 = (e: KeyboardEvent) => {
        if (e.code != "Enter") return;
        realogin();
    };
</script>

<section>
    {#if code == -1 || code !== 200}
        <div>
            <input
                class="w-full p-4 text-sm bg-gray-50 focus:outline-none border border-gray-200 rounded text-gray-600"
                type="text"
                placeholder="Correo UC"
                bind:value={email}
                on:keyup={handleKeyup1}
            />
        </div>
        <div class="py-2">
            <button
                class="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded text-sm font-bold text-gray-50 transition duration-200"
                on:click={prelogin}
                >Login
            </button>
        </div>
    {:else}
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
                placeholder="Código de Verificación"
                bind:value={verifycode}
                on:keyup={handleKeyup2}
            />
        </div>
        <div class="py-2">
            <button
                class="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded text-sm font-bold text-gray-50 transition duration-200"
                on:click={realogin}
                >Verificar Código
            </button>
        </div>
    {/if}

    {#if (code !== -1 && code !== 200) || (code2 !== -1 && code2 !== 200)}
        <div class="py-2">
            <p
                class="w-full p-4 text-sm bg-red-100 focus:outline-none border border-gray-200 rounded text-gray-600"
            >
                {message}
            </p>
        </div>
    {/if}
</section>
