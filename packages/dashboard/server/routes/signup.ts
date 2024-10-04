import { Hono } from 'hono'
import { entity } from '../entities/user'
import { z } from 'zod'
import { password as bunPassword } from 'bun'
import { auth } from '../auth'
import { add } from 'date-fns'
import validatePassword from '../utils/validatePassword'
import { zValidator } from '@hono/zod-validator'

const signup = new Hono()

signup.post(
    "/",
    zValidator("json", z.object({
        first_name: z.string(),
        last_name: z.string(),
        email: z.string(),
        password: z.string()
    })),
    async (c) => {

        const {
            first_name,
            last_name,
            email,
            password
        } = c.req.valid("json")

        const passwordStrength = validatePassword(password)

        // check password strength
        if (!passwordStrength.isValid()) {
            return c.json({
                message: 'Password too weak',
                meta: passwordStrength.getMessages()
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

        } catch (e: any) {
            return c.json(e, 400)
        }
    })

export default signup