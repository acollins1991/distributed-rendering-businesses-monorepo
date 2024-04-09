import { describe, test, expect } from "bun:test"
import createTeam from "../createTeam"
import type { APIGatewayProxyEvent } from 'aws-lambda';
import createAPIRequestEvent from "../../../factories/APIRequestEvent";
import createUserFactory from "../../../factories/User";

describe('createTeam', () => {
    test('returns a new team record with authorised user sub as default user', async () => {
        const authUser = createUserFactory()
        const mockRequest = createAPIRequestEvent(
            'POST',
            authUser,
            JSON.stringify({
                name: 'Testing Team 123'
            })
        )

        const req = await createTeam(mockRequest)

        expect(req.statusCode).toBe(200)
        expect(JSON.parse(req.body).name).toBe('Testing Team 123')
        expect(JSON.parse(req.body).users[0]).toBe(authUser.id)
    })
    test('returns a new team record with explicit users, including sub user', async () => {
        const authUser = createUserFactory()
        const teamName = 'Testing Team ' + crypto.randomUUID()

        const mockRequest = createAPIRequestEvent(
            'POST',
            authUser,
            JSON.stringify({
                name: teamName,
                users: [authUser.id, '345', '678']
            })
        )

        const req = await createTeam(mockRequest)

        expect(req.statusCode).toBe(200)
        expect(JSON.parse(req.body).name).toBe(teamName)
        expect(JSON.parse(req.body).users).toEqual([authUser.id, '345', '678'])
    })
})