import { describe, test, expect } from "bun:test"
import createTeam from "../createTeam"
import type { APIGatewayProxyEvent } from 'aws-lambda';
import createAPIRequestEvent from "../../../factories/APIRequestEvent";

describe('createTeam', () => {
    test('returns a new team record with authorised user sub as default user', async () => {
        const mockRequest = createAPIRequestEvent(
            'POST',
            '123',
            JSON.stringify({
                name: 'Testing Team 123'
            })
        )

        const req = await createTeam(mockRequest)

        expect(req.statusCode).toBe(200)
        expect(JSON.parse(req.body).name).toBe('Testing Team 123')
        expect(JSON.parse(req.body).users[0]).toBe('123')
    })
    test('returns a new team record with explicit users, including sub user', async () => {
        const authUserSub = '123'
        const teamName = 'Testing Team ' + crypto.randomUUID()

        // @ts-ignore
        const mockRequest: APIGatewayProxyEvent = {
            httpMethod: "POST",
            headers: {},
            requestContext: {
                authorizer: {
                    claims: {
                        sub: authUserSub
                    }
                }
            },
            body: JSON.stringify({
                name: teamName,
                users: [authUserSub, '345', '678']
            })
        } as APIGatewayProxyEvent

        const req = await createTeam(mockRequest)

        expect(req.statusCode).toBe(200)
        expect(JSON.parse(req.body).name).toBe(teamName)
        expect(JSON.parse(req.body).users).toEqual([authUserSub, '345', '678'])
    })
})