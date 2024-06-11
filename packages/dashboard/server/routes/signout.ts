import { Hono } from "hono";
import { auth } from "../auth";
import apiValidateAuthCookie from "../utils/apiValidateAuthCookie";
import type { User } from "lucia";

const signout = new Hono<{
    Variables: {
        user: User
    }
}>()

signout.post(
    "/",
    apiValidateAuthCookie,
    async (c) => {
        const user = c.get("user")
        await auth.invalidateUserSessions(user.id)
        return c.json({
            message: 'User signed out'
        }, 200)
    })

export default signout