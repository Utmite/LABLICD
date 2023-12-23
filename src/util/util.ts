const base = "http://localhost:4321"

export const checkAuth = async (url: string, token: string | undefined) => {

    if (!token) return false

    try {
        const isAuth = await fetch(base + "/api", {
            method: "POST",
            body: JSON.stringify({
                token: token,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        return isAuth.ok
    } catch (error) {
        console.log(error)
        return false
    }
}
