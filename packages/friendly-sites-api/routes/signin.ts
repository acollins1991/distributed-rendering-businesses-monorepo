import { Hono } from "hono";
import type { LambdaBindings } from "../types";
import validateLambdaEvent from "../utils/validateLambdaEvent";
import { z } from "zod";
import { auth } from "../auth";
import { entity } from "../entities/user";
import { password as bunPassword } from "bun";
import { setCookie } from "hono/cookie";
import { add } from "date-fns";

const signin = new Hono<{ Bindings: LambdaBindings }>()

const BodySchema = z.object({
    email: z.string(),
    password: z.string()
})
type BodySchemaType = z.infer<typeof BodySchema>;
signin.post(
    "/",
    validateLambdaEvent({
        bodySchema: BodySchema
    }),
    async (c) => {
        const {
            email,
            password
        } = JSON.parse(c.env.event.body as string) as BodySchemaType

        try {

            const { data } = await entity.query.email({ email }).go()
            const user = data[0]

            if (!user) {
                throw Error('Invalid email or password')
            }

            const isValidPassword = await bunPassword.verify(password, user.password_hash)

            if (!isValidPassword) {
                throw Error('Invalid email or password')
            }

            const session = await auth.createSession(user.userId, {
                expires_at: add(Date.now(), {
                    months: 1
                }).getTime()
            });

            return c.json({
                token: session.id
            }, 200)

        } catch (e) {
            return c.json(e, 400)
        }
    })

export default signin