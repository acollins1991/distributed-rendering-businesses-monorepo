import { Hono } from "hono";
import type { LambdaBindings } from "../types";
import validateLambdaEvent from "../utils/validateLambdaEvent";
import { z } from "zod";
import { auth } from "../auth";
import { entity } from "../entities/user";
import { password as bunPassword } from "bun";
import { setCookie } from "hono/cookie";

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

            const isValidPassword = await bunPassword.verify(user.password_hash, password)

            if (!isValidPassword) {
                throw Error('Invalid email or password')
            }

            const session = await auth.createSession(user.userId, {});
            const sessionCookie = auth.createSessionCookie(session.id);

            // console.log(await auth.getUserSessions(user.userId))

            setCookie(c, "Set-Cookie", sessionCookie.serialize())
            return c.redirect(`/?user=${user.userId}`, 302)


            // const password_hash = await bunPassword.hash(password)
            // const { data: user } = await entity.create({
            //     first_name,
            //     last_name,
            //     email,
            //     password_hash
            // }).go()

            // const session = await auth.createSession(user.userId, {});
            // const sessionCookie = auth.createSessionCookie(session.id);

            // setCookie(c, "Set-Cookie", sessionCookie.serialize())
            // return c.redirect(`/?user=${user.userId}`, 302)

        } catch (e) {
            return c.json(e, 400)
        }
    })

export default signin