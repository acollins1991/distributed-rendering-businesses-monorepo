import { Hono } from "hono";
import type { LambdaBindings } from "../types";
import validateLambdaEvent from "../utils/validateLambdaEvent";
import { z } from "zod";
import { entity as userEntity } from "../entities/user";
import { entity as resetTokenEntity } from "../entities/resettoken";
import getPasswordStrength from "../utils/getPasswordStrength";
import { auth } from "../auth";

const resetpassword = new Hono<{ Bindings: LambdaBindings }>()

const BodySchema = z.object({
    email: z.string()
})
type BodySchemaType = z.infer<typeof BodySchema>;
resetpassword.post(
    "/",
    validateLambdaEvent({
        bodySchema: BodySchema
    }),
    async (c) => {
        const {
            email
        } = JSON.parse(c.env.event.body as string) as BodySchemaType

        const { data: [user] } = await userEntity.query.email({ email }).go()

        // only create token if user exists
        if (user) {
            await resetTokenEntity.create({ userEmail: email }).go()
        }
        // create artificial delay so attackers can't guess if account exists based on response timing
        // https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html#forgot-password-request
        else {
            await new Promise((resolve): void => {
                setTimeout(resolve, Math.floor(Math.random() * (500 - 100 + 1) + 100))
            })
        }

        return c.json({
            message: `If an account exists for ${email} and email will be sent with a reset link`
        }, 200)
    })

const PatchBodySchema = z.object({
    password: z.string()
})
type PatchBodySchemaType = z.infer<typeof PatchBodySchema>;
resetpassword.patch(
    "/:resetTokenId",
    validateLambdaEvent({
        bodySchema: PatchBodySchema
    }),
    async (c) => {
        const {
            password
        } = JSON.parse(c.env.event.body as string) as PatchBodySchemaType

        // check password strength
        const passwordStrength = getPasswordStrength(password)
        if (passwordStrength.value === "Too weak") {
            return c.json({
                message: 'Password too weak'
            }, 400)
        }

        const tokenId = c.req.param('resetTokenId') as string

        const { data: resetToken } = await resetTokenEntity.get({ tokenId }).go()

        // if no token or token expiration has been reached
        if (!resetToken || (resetToken.expires_at && Date.now() > resetToken.expires_at)) {
            return c.json({
                message: "The password reset link is invalid or expired. Please request a new password reset."
            }, 400)
        }

        // update password hash
        // TODO: is there a more efficient way to do this?
        const hashedPassword = await Bun.password.hash(password)
        const { data: [user] } = await userEntity.query.email({ email: resetToken.userEmail }).go()
        await userEntity.patch({ userId: user.userId }).set({ password_hash: hashedPassword }).go()

        // invalidate user sessions
        await auth.invalidateUserSessions(user.userId)

        // delete reset token record
        await resetTokenEntity.delete({ tokenId: resetToken.tokenId }).go()

        return c.json({
            message: 'Password updated'
        }, 200)
    })

export default resetpassword