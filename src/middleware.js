import { checkAuth } from "./util/util.ts";


export const onRequest = async ({ redirect, cookies, url }, next) => {

    const token = cookies.get("token");
    if (!(await checkAuth(null, token?.value))) {
        if (url.pathname === "/login" || url.pathname === "/api" || url.pathname === "/logout") return next()
        return redirect("/login", 301)
    }

    if (url.pathname === "/login") return redirect("/", 301)

    return next()
}