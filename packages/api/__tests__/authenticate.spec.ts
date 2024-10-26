import { describe, test, expect } from "bun:test"
import createUserFactory from "../factories/User"
import ApiRequestFactory from "../factories/ApiRequest"
import validateBearerToken from "../utils/validateAuthCookie"

describe("/authenticate", () => {
    describe("POST", () => {

        test("bad token returns authenticated false", async () => {

            const { session } = await createUserFactory()
            const { valid } = await validateBearerToken(session.id)
            expect(valid).toBe(true)

            const res = await new ApiRequestFactory("authenticate").post.setAuthSession(crypto.randomUUID()).go()
            expect(res.statusCode).toBe(200)

            const json = JSON.parse(res.body)

            expect(json.authenticated).toBe(false)
            expect(json.user).toBeFalsy()

        })

        test("signin creates a new session", async () => {

            const { session } = await createUserFactory()
            const { valid } = await validateBearerToken(session.id)
            expect(valid).toBe(true)

            const res = await new ApiRequestFactory("authenticate").post.setAuthSession(session.id).go()
            expect(res.statusCode).toBe(200)

            const json = JSON.parse(res.body)

            expect(json.authenticated).toBe(true)
            expect(json.user).toBeTruthy()

        })
    })
})