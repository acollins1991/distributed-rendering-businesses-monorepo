import { describe, test, expect } from "bun:test"
import createTeam from "../createTeam"
import type { APIGatewayProxyEvent } from 'aws-lambda';

import { entity as teamEntity } from "../../entities/team"

describe('createTeam', () => {

    test('creates a new team record', async () => {

        // @ts-ignore
        const mockRequest: APIGatewayProxyEvent = {
            httpMethod: "POST",
            headers: {},
            requestContext: {
                authorizer: {
                    claims: {
                        sub: '123'
                    }
                }
            },
            body: JSON.stringify({
                name: 'Testing Team 123'
            })
        } as APIGatewayProxyEvent

        const req = await createTeam(mockRequest)

        console.log(req.body)

        expect(req.statusCode).toBe(200)
    })
})