import type { Context } from 'hono'
import { setCookie } from 'hono/cookie'
import type validateAuthCookie from './validateAuthCookie'
import { tokenCookieName } from './authCookieName'

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