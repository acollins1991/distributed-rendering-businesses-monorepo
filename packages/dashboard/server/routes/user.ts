import { Hono } from "hono";
import apiValidateAuthCookie from "../utils/apiValidateAuthCookie";
import type { User } from "lucia";
import { entity } from "../entities/user";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const user = new Hono<{
    Variables: {
        user: User
    }
}>()

user.get(
    "/",
    apiValidateAuthCookie,
    async (c) => {
        try {
            const user = c.get("user") as User
            return c.json(user, 200)

        } catch (e: any) {
            return c.json(e, 400)
        }
    })

user.patch(
    "/",
    zValidator("json", z.object({
        first_name: z.string(),
        last_name: z.string(),
        email: z.string()
    }).partial()),
    apiValidateAuthCookie,
    async (c) => {

        const patchObject = c.req.valid("json")

        try {

            const user = c.get("user") as User

            const { data: updatedUser } = await entity.patch({ userId: user.userId }).set(patchObject).go({
                response: "all_new"
            })

            return c.json(updatedUser, 200)

        } catch (e: any) {
            return c.json(e, 400)
        }
    })

export default user