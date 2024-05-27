import { describe, test, expect, beforeAll } from "bun:test"
import { entity, type User } from "../entities/user"
import { faker } from "@faker-js/faker"
import createUserFactory from "../factories/User"
import validateBearerToken from "../utils/validateBearerToken"
import type { Session } from "lucia"
import ApiRequestFactory from "../factories/ApiRequest"

describe("/user", () => {

    let databaseUser: User
    let bearerToken: Session["id"]

    beforeAll(async () => {
        const { user, session } = await createUserFactory()
        databaseUser = user
        bearerToken = session.id
    })

    describe("GET", () => {

        test("valid bearer token returns user from session", async () => {
            // confirm session currently valid
            const { valid, user } = await validateBearerToken(bearerToken)
            expect(valid).toBe(true)

            //
            const res = await new ApiRequestFactory("/api/user").setAuthSession(bearerToken).go()

            expect(res.status).toBe(200)
            const json = await res.json()
            expect(json.id).toBe(user?.id)
        })

    })

    describe("PATCH", () => {

        test('updates the user record based on the bearer token', async () => {

            const newFirstName = faker.person.firstName()
            const newEmail = faker.internet.email({
                firstName: newFirstName,
            })

            const res = await new ApiRequestFactory("/api/user", {
                first_name: newFirstName,
                email: newEmail
            }).patch.setAuthSession(bearerToken).go()

            expect(res.status).toBe(200)
            const json = await res.json()
            expect(json.userId).toBe(databaseUser.userId)
            expect(json.first_name).toBe(newFirstName)
            expect(json.email).toBe(newEmail)

            // check record has updated
            const { data: refreshedUserRecord } = await entity.get({ userId: databaseUser.userId }).go()
            expect(refreshedUserRecord?.first_name).toBe(newFirstName)
            expect(refreshedUserRecord?.email).toBe(newEmail)
        })

    })

})