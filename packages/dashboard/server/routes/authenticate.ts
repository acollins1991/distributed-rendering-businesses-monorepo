import { Hono } from "hono";
import validateBearerToken from "../utils/validateBearerToken";

const authenticate = new Hono()

authenticate.post(
    "/",
    async (c) => {

        const token = c.req.header('authorization')?.replace('Bearer ', '')

        if (!token) {
            return c.json({
                message: 'Missing bearer token'
            }, 400)
        }

        try {

            const { valid, user } = await validateBearerToken(token)

            return c.json({
                authenticated: valid,
                user: valid ? user : null
            }, 200)

        } catch (e) {
            return c.json(e, 400)
        }
    })

export default authenticate