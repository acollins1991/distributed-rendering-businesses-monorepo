import { describe, test, expect, beforeAll } from "bun:test"
import { type User } from "../entities/user"
import { entity as sessionEntity } from "../entities/sessions"
import { faker } from "@faker-js/faker"
import createUserFactory from "../factories/User"
import { auth } from "../auth"
import validateBearerToken from "../utils/validateBearerToken"
import type { Session } from "lucia"
import { app } from ".."

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
            const res = await app.request("/signout", {
                method: "POST",
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
        })

    })

})