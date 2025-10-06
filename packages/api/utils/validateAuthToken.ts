import { auth } from "../auth";

export default async function (token: string) {

    let valid: Boolean = false
    const { session, user } = await auth.validateSession(token);

    if (session && user) {
        valid = true
    }

    return {
        valid,
        session,
        user
    }
}