import { describe, test, expect, beforeAll } from "bun:test"
import { type User } from "../entities/user"
import createUserFactory from "../factories/User"
import validateBearerToken from "../utils/validateAuthToken"
import type { Session } from "lucia"
import ApiRequestFactory from "../factories/ApiRequest"

describe("/signout", () => {

    describe("POST", () => {

        let databaseUser: User
        let bearerToken: Session["id"]

        beforeAll(async () => {
            const { user, session } = await createUserFactory()
            databaseUser = user
            bearerToken = session.id
        })

        test("invalidates all user sessions", async () => {
            // confirm session currently valid
            const { valid } = await validateBearerToken(bearerToken)
            expect(valid).toBe(true)

            //
            const res = await new ApiRequestFactory("signout").post.setAuthSession(bearerToken).go()
            expect(res.statusCode).toBe(200)
        })

    })

})