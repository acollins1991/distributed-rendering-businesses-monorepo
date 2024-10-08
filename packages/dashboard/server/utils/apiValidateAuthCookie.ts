import { createMiddleware } from 'hono/factory'
import validateAuthCookie from "./validateAuthCookie";
import { getCookie } from 'hono/cookie'
import setAuthCookie from './setAuthCookie';
import { tokenCookieName } from './authCookieName';

const apiValidateAuthCookie = createMiddleware(async (c, next) => {
    const token = getCookie(c, tokenCookieName)

    if (!token) {
        return c.json({
            message: 'Missing authentication'
        }, 403)
    }

    const { valid, user, session } = await validateAuthCookie(token)

    if (!valid || !user || !session) {
        return c.json({
            message: 'Invalid authentication'
        }, 403)
    }

    c.set("user", user)
    c.set("token", token)

    await next()
})

export default apiValidateAuthCookie