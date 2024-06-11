import { auth } from "../auth";

export default async function (cookie: string) {

    let valid: Boolean = false
    const { session, user } = await auth.validateSession(cookie);

    if (session && user) {
        valid = true
    }

    return {
        valid,
        session,
        user
    }
}