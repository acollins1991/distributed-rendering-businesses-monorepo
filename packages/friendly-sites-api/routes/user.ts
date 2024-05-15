import { Hono } from "hono";
import type { LambdaBindings } from "../types";
import apiValidateBearerTokenMiddleware from "../utils/apiValidateBearerTokenMiddleware";
import type { User } from "lucia";
import { entity } from "../entities/user";
import { z } from "zod";
import validateLambdaEvent from "../utils/validateLambdaEvent";

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

const PatchBodySchema = z.object({
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email: z.string().optional()
})
type PatchBodySchemaType = z.infer<typeof PatchBodySchema>;
user.patch(
    "/",
    validateLambdaEvent({
        bodySchema: PatchBodySchema
    }),
    apiValidateBearerTokenMiddleware,
    async (c) => {

        const patchObject = JSON.parse(c.env.event.body as string) as PatchBodySchemaType

        try {

            const user = c.get("user") as User

            const updatedUser = await entity.patch({ userId: user.userId }).set(patchObject).go()

            return c.json(user, 200)

        } catch (e) {
            return c.json(e, 400)
        }
    })

export default user