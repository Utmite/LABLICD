const base = "http://localhost:4321"

export const checkAuth = async (url: string | null, token: string | undefined) => {

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

export function isValidURL(str: string | undefined) {
    if (!str) return false

    return true
}
