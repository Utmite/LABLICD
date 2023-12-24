import { checkAuth } from "./util/util.ts";


export const onRequest = async ({ redirect, cookies, url }, next) => {

    if (url.pathname === "/api") return next()

    const token = cookies.get("token");

    if (!(await checkAuth(null, token?.value))) {
        if (url.pathname === "/login") return next()
        return redirect("/login", 307)
    }

    if (url.pathname === "/login") return redirect("/", 307)


    return next()
}