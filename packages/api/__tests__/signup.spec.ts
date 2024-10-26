import { describe, test, expect } from "bun:test"
import { faker } from "@faker-js/faker"
import { entity as userEntity } from "../entities/user"
import { entity as sessionEntity } from "../entities/sessions"
import ApiRequestFactory from "../factories/ApiRequest"
import createUserFactory from "../factories/User"
import generator from 'generate-password'

function createUserDetails() {
    const first_name = faker.person.firstName()
    const last_name = faker.person.firstName()
    const email = faker.internet.email({
        firstName: first_name.toLocaleLowerCase(),
        lastName: last_name.toLocaleLowerCase()
    })

    return {
        first_name,
        last_name,
        email
    }
}

describe("/signup endpoint", () => {
    describe('POST', () => {

        const password = generator.generate({
            length: 16,
            uppercase: true,
            lowercase: true,
            symbols: true
        })
        const weakPassword = faker.internet.password({
            length: 4
        })

        test('request with weak password fails', async () => {
            const personRequest = {
                ...createUserDetails(),
                password: weakPassword
            }

            const res = await new ApiRequestFactory("signup", personRequest).post.go()

            expect(res.statusCode).toBe(400)
            expect(JSON.parse(res.body).message).toBe("Password too weak")
        })

        test('successful request creates user and session', async () => {

            const userDetails = createUserDetails()

            const personRequest = {
                ...userDetails,
                password
            }

            const res = await new ApiRequestFactory("signup", personRequest).post.go()

            // returns redirect
            expect(res.statusCode).toBe(200)

            // get user with email
            const { data: users } = await userEntity.scan.where(({ email: recordEmail }, { eq }) => eq(recordEmail, userDetails.email)).go()
            const targetUser = users[0]
            expect(targetUser.email).toBe(userDetails.email)

            // returns token, which is bearer token for user
            const json = JSON.parse(res.body)
            const { data: sessions } = await sessionEntity.scan.go()
            const targetSession = sessions.find(session => session.sessionId === json.token)
            expect(targetSession?.userId).toBe(targetUser.userId)
        })

        test("signup with duplicate email fails", async () => {

            // create existing user
            const { user } = await createUserFactory()

            const userDetails = createUserDetails()

            const personRequest = {
                ...userDetails,
                email: user.email,
                password
            }

            const res = await new ApiRequestFactory("signup", personRequest).post.go()

            expect(res.statusCode).toBe(400)
            const json = JSON.parse(res.body)
            expect(json.message).toBe('Account with this email already exists')
        })
    })
})