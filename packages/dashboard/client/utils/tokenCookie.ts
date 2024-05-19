import { getCookie, setCookie } from "typescript-cookie"

const tokenCookieName = 'friendly_sites_auth_cookie'

export function setTokenCookie(token: string) {
    return setCookie(tokenCookieName, token)
}

export function getTokenCookie() {
    return getCookie(tokenCookieName)
}
