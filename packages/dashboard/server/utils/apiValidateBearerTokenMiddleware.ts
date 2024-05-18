import type { Context } from "hono";
import { createMiddleware } from 'hono/factory'
import validateBearerToken from "./validateBearerToken";

const apiValidateBearerTokenMiddleware = createMiddleware(async (c, next) => {
    const token = c.req.header('authorization')?.replace('Bearer ', '')
    if (!token) {
        return c.json({
            message: 'Missing bearer token'
        }, 403)
    }

    const { valid, user } = await validateBearerToken(token)

    if (!valid || !user) {
        return c.json({
            message: 'Invalid token'
        }, 403)
    }

    c.set("user", user)
    c.set("token", token)

    await next()
})

export default apiValidateBearerTokenMiddleware