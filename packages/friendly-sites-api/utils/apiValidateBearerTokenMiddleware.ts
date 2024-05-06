import type { Context } from "hono";
import type { ApiContext, LambdaBindings } from "../types";
import { createMiddleware } from 'hono/factory'
import validateBearerToken from "./validateBearerToken";
import type { User } from "lucia";

const apiValidateBearerTokenMiddleware = createMiddleware(async (c: Context<ApiContext>, next) => {
    const token = c.env.event.headers?.authorization?.replace('Bearer ', '')
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