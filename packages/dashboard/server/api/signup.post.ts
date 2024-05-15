import validateLambdaEvent from '../utils/validateLambdaEvent'
import { userEntity } from '../utils/entities/user'
import { z } from 'zod'
import { password as bunPassword } from 'bun'
import { auth } from '../utils/auth'
import { add } from 'date-fns'
import getPasswordStrength from '../utils/getPasswordStrength'

const BodySchema = z.object({
    first_name: z.string(),
    last_name: z.string(),
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
        first_name,
        last_name,
        email,
        password
    } = data

    const passwordStrength = getPasswordStrength(password)

    // check password strength
    if (passwordStrength.value === "Too weak") {
        throw createError({
            statusCode: 400,
            statusMessage: 'Password too weak',
        })
    }

    // check if user with this email already exists
    const { data: [existingUserAccountFromEmail] } = await userEntity.query.email({ email }).go()
    if (existingUserAccountFromEmail) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Account with this email already exists',
        })
    }

    try {
        const password_hash = await bunPassword.hash(password)
        const { data: user } = await userEntity.create({
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
