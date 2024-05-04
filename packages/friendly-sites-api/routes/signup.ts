import { Hono } from 'hono'
import type { LambdaBindings } from '../types'
import validateLambdaEvent from '../utils/validateLambdaEvent'
import { entity } from '../entities/user'
import { z } from 'zod'
import { passwordStrength } from 'check-password-strength'
import { password as bunPassword } from 'bun'
import { auth } from '../auth'
import { setCookie } from 'hono/cookie'

const signup = new Hono<{ Bindings: LambdaBindings }>()

const BodySchema = z.object({
    first_name: z.string(),
    last_name: z.string(),
    email: z.string(),
    password: z.string()
})
type BodySchemaType = z.infer<typeof BodySchema>;
signup.post(
    "/",
    validateLambdaEvent({
        bodySchema: BodySchema
    }),
    async (c) => {

        const {
            first_name,
            last_name,
            email,
            password
        } = JSON.parse(c.env.event.body as string) as BodySchemaType

        // check password strength
        if (["Too weak", "Weak"].includes(passwordStrength(password).value)) {
            return c.json({
                meta: passwordStrength(password),
                message: 'Password too weak'
            }, 400)
        }

        try {
            const password_hash = await bunPassword.hash(password)
            const { data: user } = await entity.create({
                first_name,
                last_name,
                email,
                password_hash
            }).go()

            const session = await auth.createSession(user.userId, {});
            const sessionCookie = auth.createSessionCookie(session.id);

            setCookie(c, "Set-Cookie", sessionCookie.serialize())
            return c.redirect(`/?user=${user.userId}`, 302)

        } catch (e) {
            return c.json(e, 400)
        }
    })

export default signup