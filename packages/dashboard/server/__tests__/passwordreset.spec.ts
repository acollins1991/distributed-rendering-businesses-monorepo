import { describe, test, expect, beforeAll, setSystemTime } from "bun:test"
import { faker } from "@faker-js/faker"
import createUserFactory from "../factories/User"
import { entity, type ResetToken } from "../entities/resettoken"
import { entity as sessionEntity } from "../entities/sessions"
import { entity as userEntity } from "../entities/user"
import type { User } from "../entities/user"
import { add } from "date-fns"
import { auth } from "../auth"
import ApiRequestFactory from "../factories/ApiRequest"

describe('/passwordreset', () => {

    let databaseUser: User

    beforeAll(async () => {
        const { user } = await createUserFactory()
        databaseUser = user
    })

    describe("POST", () => {

        test("if account exists for the email return a 200 with success and reset token record is created", async () => {

            const res = await new ApiRequestFactory('/api/passwordreset', {
                email: databaseUser.email
            }).post.go()

            const json = await res.json()

            expect(res.status).toBe(200)
            expect(json.message).toBe(`If an account exists for ${databaseUser.email} an email will be sent with a reset link`)
            const { data: resettoken } = await entity.scan.where(({ userEmail }, { eq }) => eq(userEmail, databaseUser.email)).go()
            expect(resettoken).toBeTruthy()
        })

        test("if no account exists for the email return a 200 with the same message as success, but no record is made", async () => {

            const email = faker.internet.email({
                firstName: faker.person.firstName().toLowerCase(),
                lastName: faker.person.lastName().toLowerCase()
            })

            //
            const res = await new ApiRequestFactory('/api/passwordreset', {
                email
            }).post.go()

            expect(res.status).toBe(200)
            const json = await res.json()
            expect(json.message).toBe(`If an account exists for ${email} an email will be sent with a reset link`)
            const { data: [resettoken] } = await entity.scan.where(({ userEmail }, { eq }) => eq(userEmail, email)).go()
            expect(resettoken).toBeFalsy()
        })

    })

    describe("PATCH", () => {

        let resetToken: ResetToken
        const newPassword = faker.internet.password({
            length: 16
        })

        beforeAll(async () => {
            const { data: token } = await entity.create({
                userEmail: databaseUser.email
            }).go()

            resetToken = token

            // create user session
            await auth.createSession(databaseUser.userId, {
                expires_at: add(Date.now(), {
                    months: 1
                }).getTime()
            })
        })

        test("request with invalid token returns the invalid message", async () => {

            //
            const res = await new ApiRequestFactory(`/api/passwordreset/${crypto.randomUUID()}`, {
                password: newPassword
            }).patch.go()

            const json = await res.json()
            expect(res.status).toBe(400)
            expect(json.message).toBe("The password reset link is invalid or expired. Please request a new password reset.")
        })

        test("request with valid but expired token returns the invalid message", async () => {

            // advance system time by 2 days so valid token is expired
            setSystemTime(add(Date.now(), { days: 2 }))

            //
            const res = await new ApiRequestFactory(`/api/passwordreset/${resetToken.tokenId}`, {
                password: newPassword
            }).patch.go()

            expect(res.status).toBe(400)
            const json = await res.json()
            expect(json.message).toBe("The password reset link is invalid or expired. Please request a new password reset.")

            // reset system time
            setSystemTime()
        })

        test("request with valid token sets new password, returns success message and invalidates user sessions", async () => {

            // confirm user has sessions
            const { data: sessions } = await sessionEntity.query.user_sessions({ userId: databaseUser.userId }).go()
            expect(sessions.length).toBeGreaterThan(0)

            // get current user password hash
            const { password_hash } = databaseUser

            //
            const res = await new ApiRequestFactory(`/api/passwordreset/${resetToken.tokenId}`, {
                password: newPassword
            }).patch.go()

            const { data: updatedUserRecord } = await userEntity.get({ userId: databaseUser.userId }).go()
            // check password hash has been changed
            expect(updatedUserRecord?.password_hash).not.toBe(password_hash)
            // confirm user sessions invalidated
            const { data: updatedSessions } = await sessionEntity.query.user_sessions({ userId: databaseUser.userId }).go()
            expect(updatedSessions.length).not.toBeGreaterThan(0)
            // deletes resettoken record
            const { data: resetTokenRecord } = await entity.get({ tokenId: resetToken.tokenId }).go()
            expect(resetTokenRecord).toBeFalsy()

            const json = await res.json()
            expect(res.status).toBe(200)
            expect(json.message).toBe('Password updated')

        })
    })

})