import { Hono } from "hono";
import { z } from "zod";
import { auth } from "../auth";
import { entity } from "../entities/user";
import { password as bunPassword } from "bun";
import { add } from "date-fns";
import { zValidator } from "@hono/zod-validator";

const signin = new Hono()

signin.post(
    "/",
    zValidator("json", z.object({
        email: z.string(),
        password: z.string()
    })),
    async (c) => {
        const {
            email,
            password
        } = c.req.valid("json")

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