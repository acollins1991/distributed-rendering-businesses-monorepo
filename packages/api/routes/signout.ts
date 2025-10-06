import { Hono } from "hono";
import { auth } from "../auth";
import type { User } from "lucia";
import apiAuthenticateRequest from "../utils/apiAuthenticateRequest";

const signout = new Hono<{
    Variables: {
        user: User
    }
}>()

signout.post(
    "/",
    apiAuthenticateRequest,
    async (c) => {
        const user = c.get("user")
        await auth.invalidateUserSessions(user.id)
        return c.json({
            message: 'User signed out'
        }, 200)
    })

export default signout