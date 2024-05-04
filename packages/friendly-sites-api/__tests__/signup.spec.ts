import { describe, test, expect } from "bun:test"
import { app } from ".."
import { faker } from "@faker-js/faker"
import { auth } from "../auth"
import { entity as userEntity } from "../entities/user"
import { entity as sessionEntity } from "../entities/sessions"

describe("/signup endpoint", () => {
    describe('POST', () => {
        test('request with weak password fails', async () => {

            const first_name = faker.person.firstName()
            const last_name = faker.person.firstName()
            const email = faker.internet.email({
                firstName: first_name.toLocaleLowerCase(),
                lastName: last_name.toLocaleLowerCase()
            })
            const password = 'weak'

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
            expect((await res.json()).message).toBe("Password too weak")
        })
        test('successful request creates user and redirects', async () => {
            const first_name = faker.person.firstName()
            const last_name = faker.person.firstName()
            const email = faker.internet.email({
                firstName: first_name.toLocaleLowerCase(),
                lastName: last_name.toLocaleLowerCase()
            })
            const password = faker.internet.password({
                length: 100
            })

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
            expect(res.status).toBe(302)

            // get user with email
            const { data: users } = await userEntity.scan.where(({ email: recordEmail }, { eq }) => eq(recordEmail, email)).go()
            const targetUser = users[0]
            expect(targetUser.email).toBe(email)
            // 
            const { data: sessions } = await sessionEntity.scan.go()
            expect(sessions.find(session => session.userId === targetUser.userId)).toBeTruthy()
        })
    })
})