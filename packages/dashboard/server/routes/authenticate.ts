import { Hono } from "hono";
import validateBearerToken from "../utils/validateAuthCookie";
import { getCookie } from "hono/cookie";
import { tokenCookieName } from "../utils/apiValidateAuthCookie";

tokenCookieName

const authenticate = new Hono()

authenticate.post(
    "/",
    async (c) => {

        const token = getCookie(c, tokenCookieName)

        if (!token) {
            return c.json({
                message: 'Missing authentication'
            }, 400)
        }

        try {

            const { valid, user } = await validateBearerToken(token)

            return c.json({
                authenticated: valid,
                user: valid ? user : null
            }, 200)

        } catch (e: any) {
            return c.json(e, 400)
        }
    })

export default authenticate