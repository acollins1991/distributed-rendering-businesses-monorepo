import { Hono } from 'hono'
import type { LambdaBindings } from '../types'
import validateLambdaEvent from '../utils/validateLambdaEvent'
import { entity } from '../entities/user'
import { z } from 'zod'
import { password as bunPassword } from 'bun'
import { auth } from '../auth'
import { add } from 'date-fns'
import getPasswordStrength from '../utils/getPasswordStrength'

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

        const passwordStrength = getPasswordStrength(password)

        // check password strength
        if (passwordStrength.value === "Too weak") {
            return c.json({
                // meta: passwordStrength(password),
                message: 'Password too weak'
            }, 400)
        }

        // check if user with this email already exists
        const { data: [existingUserAccountFromEmail] } = await entity.query.email({ email }).go()
        if (existingUserAccountFromEmail) {
            return c.json({
                message: 'Account with this email already exists'
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

export default signup