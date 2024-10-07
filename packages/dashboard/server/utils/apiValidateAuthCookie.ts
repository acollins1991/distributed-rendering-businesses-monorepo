import { createMiddleware } from 'hono/factory'
import validateAuthCookie from "./validateAuthCookie";
import { getCookie } from 'hono/cookie'
import setAuthCookie from './setAuthCookie';

export const tokenCookieName = 'friendly_sites_auth_cookie'

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

    setAuthCookie(c, session)

    c.set("user", user)
    c.set("token", token)

    await next()
})

export default apiValidateAuthCookie