import { Context, Hono } from "hono";
import { z } from "zod";
import { auth } from "../auth";
import { entity } from "../entities/user";
import { password as bunPassword } from "bun";
import { add } from "date-fns";
import { zValidator } from "@hono/zod-validator";

const signin = new Hono()

function badSignIn(c: Context) {
    return c.json({
        message: 'Invalid email or password'
    }, 401)
}

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
                return badSignIn(c)
            }

            const isValidPassword = await bunPassword.verify(password, user.password_hash)

            if (!isValidPassword) {
                return badSignIn(c)
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
            console.log(e)
            return c.json(e, 500)
        }
    })

export default signin