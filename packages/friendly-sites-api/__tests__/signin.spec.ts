import { describe, test, expect } from "bun:test"
import { app } from ".."
import { faker } from "@faker-js/faker"
import createUserFactory from "../factories/User"
import { entity as sessionEntity } from "../entities/sessions"
import { entity } from "../entities/user"

describe("/signin", () => {
    describe("POST", () => {
        test("signin creates a new session", async () => {
            const first_name = faker.person.firstName()
            const last_name = faker.person.lastName()
            const email = faker.internet.email({
                firstName: first_name,
                lastName: last_name
            })
            const password = faker.internet.password({
                length: 16,
                memorable: true
            })


            const user = await createUserFactory({
                first_name,
                last_name,
                email,
                password
            })

            const res = await app.request("/signin", {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                }
            }, {
                event: {
                    body: JSON.stringify({
                        email,
                        password
                    }),
                }
            })

            const { data: [session] } = await sessionEntity.scan.where(({ userId }, { eq }) => eq(userId, user.userId)).go()

            expect(res.status).toBe(200)

            const json = await res.json()

            expect(json.token).toBe(session.sessionId)
            expect(session).toBeTruthy()

        })
    })
})