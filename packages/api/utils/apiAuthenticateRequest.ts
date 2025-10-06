import { createMiddleware } from 'hono/factory'
import validateAuthToken from './validateAuthToken'

const apiAuthenticateRequest = createMiddleware(

    async (c, next) => {

        const headers = c.req.header()
        const authHeader = headers['Authorization'] ?? headers['authorization']

        if (!authHeader) {
            return c.json({
                message: 'Missing authentication'
            }, 403)
        }

        const token = authHeader.replace('Bearer ', '')
        const { valid, user, session } = await validateAuthToken(token)

        if (!valid || !user || !session) {
            return c.json({
                message: 'Invalid authentication'
            }, 403)
        }

        c.set("user", user)
        c.set("token", token)

        await next()
    }
)

export default apiAuthenticateRequest