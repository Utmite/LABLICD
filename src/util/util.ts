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

export function isValidURL(str: string | undefined) {
    if (!str) return false

    var pattern = new RegExp(
        "^(https?:\\/\\/)?" + // protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$",
        "i",
    ); // fragment locator
    return !!pattern.test(str);
}