<script>
    import LogoutIcon from "./icons/goLogout.svelte";

    const logout = async () => {
        const response = await fetch("/api", {
            method: "DELETE",
        });

        if (!response.ok) return;

        window.location.reload();
    };
</script>

<button class="w-14 h-14" on:click={logout}>
    <LogoutIcon></LogoutIcon>
</button>
