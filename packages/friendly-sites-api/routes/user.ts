import { Hono } from "hono";
import type { LambdaBindings } from "../types";
import apiValidateBearerTokenMiddleware from "../utils/apiValidateBearerTokenMiddleware";
import type { User } from "lucia";

const user = new Hono<{ Bindings: LambdaBindings }>()

user.get(
    "/",
    apiValidateBearerTokenMiddleware,
    async (c) => {
        try {

            const user = c.get("user") as User

            return c.json(user, 200)

        } catch (e) {
            return c.json(e, 400)
        }
    })

export default user