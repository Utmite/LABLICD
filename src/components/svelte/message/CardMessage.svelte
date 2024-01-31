<script lang="ts">
    export let message: string;
    export let code: number;
</script>

{#if code !== 200 && code > 0}
    <div class="py-2">
        <p
            class="w-full p-4 text-sm bg-red-100 focus:outline-none border border-gray-200 rounded text-gray-600 overflow-y-auto"
        >
            {message}
        </p>
    </div>
{:else if code > 0}
    <div class="py-2">
        <p
            class="w-full p-4 text-sm bg-green-100 focus:outline-none border border-gray-200 rounded text-gray-600"
        >
            {message}
        </p>
    </div>
{:else if code < 0}
    <div class="py-2">
        <p
            class="w-full p-4 text-sm bg-blue-100 focus:outline-none border border-gray-200 rounded text-gray-600"
        >
            {message}
        </p>
    </div>
{/if}
