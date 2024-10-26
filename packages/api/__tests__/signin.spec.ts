import { describe, test, expect } from "bun:test"
import { faker } from "@faker-js/faker"
import createUserFactory from "../factories/User"
import ApiRequestFactory from "../factories/ApiRequest"

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


            const { session } = await createUserFactory({
                first_name,
                last_name,
                email,
                password
            })

            const res = await new ApiRequestFactory("signin", {
                email,
                password
            }).post.go()

            expect(res.statusCode).toBe(200)

            const json = JSON.parse(res.body)

            expect(json.token).toBeTruthy()
            expect(session).toBeTruthy()

        })
    })
})