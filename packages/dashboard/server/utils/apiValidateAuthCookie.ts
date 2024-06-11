import { createMiddleware } from 'hono/factory'
import validateAuthCookie from "./validateAuthCookie";
import { getCookie } from 'hono/cookie'

export const tokenCookieName = 'friendly_sites_auth_cookie'

const apiValidateAuthCookie = createMiddleware(async (c, next) => {
    const token = getCookie(c, tokenCookieName)
    if (!token) {
        return c.json({
            message: 'Missing authentication'
        }, 403)
    }

    const { valid, user } = await validateAuthCookie(token)

    if (!valid || !user) {
        return c.json({
            message: 'Invalid authentication'
        }, 403)
    }

    c.set("user", user)
    c.set("token", token)

    await next()
})

export default apiValidateAuthCookie