import { describe, beforeAll, test, expect } from "bun:test"
import type { DatabaseUser } from "lucia"
import { entity } from "../../entities/user"
import { faker } from "@faker-js/faker"
import { auth } from "../../auth"
import { add } from "date-fns"
import validateAuthToken from "../validateAuthToken"

describe("validateAuthToken", () => {
    let databaseUser: DatabaseUser
    let databaseSession: Awaited<ReturnType<typeof auth.createSession>>

    beforeAll(async () => {
        const first_name = faker.person.firstName()
        const last_name = faker.person.lastName()
        const password = faker.internet.password()
        const { data: user } = await entity.create({
            first_name: first_name,
            last_name: last_name,
            email: faker.internet.email({
                firstName: first_name.toLowerCase(),
                lastName: last_name.toLowerCase()
            }),
            password_hash: Bun.password.hashSync(password)
        }).go()

        databaseUser = {
            id: user.userId,
            attributes: user
        }

        databaseSession = await auth.createSession(databaseUser.id, {
            expires_at: add(Date.now(), {
                months: 2
            }).getTime()
        })
    })

    test("good auth token returns session and user", async () => {
        const { valid, session, user } = await validateAuthToken(databaseSession.id)
        expect(valid).toBe(true)
        expect(session).toBeTruthy()
        expect(user?.id).toBe(databaseUser.id)
    })

    test("bad bearer token returns null session and user", async () => {
        const { valid, session, user } = await validateAuthToken(crypto.randomUUID())
        expect(valid).toBe(false)
        expect(session).toBe(null)
        expect(user).toBe(null)
    })
})