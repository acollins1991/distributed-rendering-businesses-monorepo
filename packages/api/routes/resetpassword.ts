import { Hono } from "hono";
import { z } from "zod";
import { entity as userEntity } from "../entities/user";
import { entity as resetTokenEntity } from "../entities/resettoken";
import validatePassword from "../utils/validatePassword";
import { auth } from "../auth";
import { zValidator } from '@hono/zod-validator'
import { parseStringifiedToZod } from "../utils/parseStringifiedToZod";

const resetpassword = new Hono()

resetpassword.post(
    "/",
    zValidator(
        'json',
        parseStringifiedToZod(z.object({
            email: z.string()
        }))
    ),
    async (c) => {
        const { email } = c.req.valid("json");

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
            message: `If an account exists for ${email} an email will be sent with a reset link`
        }, 200)
    })

resetpassword.patch(
    "/:resetTokenId",
    zValidator(
        'json',
        parseStringifiedToZod(z.object({
            password: z.string()
        }))
    ),
    async (c) => {
        const {
            password
        } = c.req.valid("json");

        // check password strength
        const passwordStrength = validatePassword(password)
        if (!passwordStrength.isValid()) {
            return c.json({
                message: 'Password too weak',
                meta: passwordStrength.getMessages()
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