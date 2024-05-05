import { describe, test, expect } from "bun:test"
import { app } from ".."
import { faker } from "@faker-js/faker"
import { auth } from "../auth"
import { entity as userEntity } from "../entities/user"
import { entity as sessionEntity } from "../entities/sessions"

describe("/signup endpoint", () => {
    describe('POST', () => {

        const first_name = faker.person.firstName()
        const last_name = faker.person.firstName()
        const email = faker.internet.email({
            firstName: first_name.toLocaleLowerCase(),
            lastName: last_name.toLocaleLowerCase()
        })
        const password = faker.internet.password({
            length: 16
        })
        const weakPassword = faker.internet.password({
            length: 4
        })

        test('request with weak password fails', async () => {
            const personRequest = {
                first_name,
                last_name,
                email,
                password: weakPassword
            }

            const res = await app.request("/signup", {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                }
            }, {
                event: {
                    body: JSON.stringify(personRequest),
                }
            })

            expect(res.status).toBe(400)
            expect((await res.json()).message).toBe("Password too weak")
        })
        test('successful request creates user and session', async () => {

            const personRequest = {
                first_name,
                last_name,
                email,
                password
            }

            const res = await app.request("/signup", {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                }
            }, {
                event: {
                    body: JSON.stringify(personRequest),
                }
            })

            // returns redirect
            expect(res.status).toBe(200)

            // get user with email
            const { data: users } = await userEntity.scan.where(({ email: recordEmail }, { eq }) => eq(recordEmail, email)).go()
            const targetUser = users[0]
            expect(targetUser.email).toBe(email)

            // returns token, which is bearer token for user
            const json = await res.json()
            const { data: sessions } = await sessionEntity.scan.go()
            const targetSession = sessions.find(session => session.sessionId === json.token)
            expect(sessions.find(session => session.sessionId === json.token)).toBeTruthy()
            expect(targetSession?.userId).toBe(targetUser.userId)
        })

        test("signup with duplicate email fails", async () => {

            const personRequest = {
                first_name,
                last_name,
                email,
                password
            }

            const res = await app.request("/signup", {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                }
            }, {
                event: {
                    body: JSON.stringify(personRequest),
                }
            })

            expect(res.status).toBe(400)
            const json = await res.json()
            expect(json.message).toBe('Account with this email already exists')
        })
    })
})