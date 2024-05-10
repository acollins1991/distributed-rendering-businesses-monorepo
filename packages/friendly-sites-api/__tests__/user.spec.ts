import { describe, test, expect, beforeAll } from "bun:test"
import { type User } from "../entities/user"
import { entity as sessionEntity } from "../entities/sessions"
import { faker } from "@faker-js/faker"
import createUserFactory from "../factories/User"
import { auth } from "../auth"
import validateBearerToken from "../utils/validateBearerToken"
import type { Session } from "lucia"
import { app } from ".."

describe("/user", () => {

    describe("GET", () => {

        let databaseUser: User
        let bearerToken: Session["id"]

        beforeAll(async () => {
            const { user, session } = await createUserFactory()
            databaseUser = user
            bearerToken = session.id
        })

        test("valid bearer token returns user from session", async () => {
            // confirm session currently valid
            const { valid, user } = await validateBearerToken(bearerToken)
            expect(valid).toBe(true)

            //
            const res = await app.request("/user", {
                method: "GET",
                headers: {
                    "content-type": "application/json"
                }
            }, {
                event: {
                    headers: {
                        authorization: `Bearer ${bearerToken}`
                    }
                }
            })

            expect(res.status).toBe(200)
            const json = await res.json()
            expect(json.id).toBe(user?.id)
        })

    })

})