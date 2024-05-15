import validateLambdaEvent from "../utils/validateLambdaEvent";
import { z } from "zod";
import { auth } from "../utils/auth";
import { userEntity } from "../utils/entities/user";
import { password as bunPassword } from "bun";
import { add } from "date-fns";

const BodySchema = z.object({
    email: z.string(),
    password: z.string()
})
export default defineEventHandler(async (event) => {

    const { success, data } = await readValidatedBody(event, body => BodySchema.safeParse(body))

    if (!success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'ID should be an integer',
        })
    }

    const {
        email,
        password
    } = data

    try {

        const { data } = await userEntity.query.email({ email }).go()
        const user = data[0]

        if (!user) {
            throw createError({
                statusCode: 403,
                statusMessage: 'Invalid email or password',
            })
        }

        const isValidPassword = await bunPassword.verify(password, user.password_hash)

        if (!isValidPassword) {
            throw createError({
                statusCode: 403,
                statusMessage: 'Invalid email or password',
            })
        }

        const session = await auth.createSession(user.userId, {
            expires_at: add(Date.now(), {
                months: 1
            }).getTime()
        });

        return {
            token: session.id
        }

    } catch (e) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Server error',
            data: e
        })
    }
})