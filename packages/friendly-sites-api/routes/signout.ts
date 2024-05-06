import { Hono } from "hono";
import type { LambdaBindings } from "../types";
import { auth } from "../auth";
import apiValidateBearerTokenMiddleware from "../utils/apiValidateBearerTokenMiddleware";
import type { User } from "lucia";

const signout = new Hono<{ Bindings: LambdaBindings }>()

signout.post(
    "/",
    apiValidateBearerTokenMiddleware,
    async (c) => {
        const user = c.get("user") as User
        await auth.invalidateUserSessions(user.id)
        return c.json({
            message: 'User signed out'
        }, 200)
    })

export default signout