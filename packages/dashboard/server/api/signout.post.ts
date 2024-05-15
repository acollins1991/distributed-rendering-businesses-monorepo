import { auth } from "../utils/auth";
import validateTokenAndGetUser from "../utils/validateTokenAndGetUser";

export default defineEventHandler(async (event) => {
    const user = await validateTokenAndGetUser(event)

    try {
        await auth.invalidateUserSessions(user.id)
        return {
            message: 'User signed out'
        }

    } catch (e) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Server error',
            data: e
        })
    }
})