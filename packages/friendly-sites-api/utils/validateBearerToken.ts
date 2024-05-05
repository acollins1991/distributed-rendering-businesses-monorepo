import { auth } from "../auth";

export default async function (bearerToken: string) {

    let valid: Boolean = false
    const { session, user } = await auth.validateSession(bearerToken);

    if (session && user) {
        valid = true
    }

    return {
        valid,
        session,
        user
    }
}