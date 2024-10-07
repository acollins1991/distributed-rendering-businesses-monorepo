import type { Context } from 'hono'
import { setCookie } from 'hono/cookie'
import { tokenCookieName } from './apiValidateAuthCookie'
import type validateAuthCookie from './validateAuthCookie'

export default function setAuthCookie(c: Context, session: NonNullable<
    Awaited<
        ReturnType<
            typeof validateAuthCookie>
        >["session"]>) {
    setCookie(c, tokenCookieName, session.id, {
        // sameSite: "None",
        // httpOnly: true
    })
}