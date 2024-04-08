import { describe, test, expect, beforeAll } from "bun:test"
import { entity as teamEntity } from "../../../entities/team"
import updateTeam from "../updateTeam"
import type { APIGatewayProxyEvent } from "aws-lambda"

describe('updateTeam', () => {

    let team
    const teamName = 'Team ' + crypto.randomUUID()
    const authUser = {
        sub: crypto.randomUUID()
    }

    beforeAll(async () => {
        const teamRes = await teamEntity.create({
            name: teamName,
            users: [authUser.sub]
        }).go()

        team = teamRes.data
    })

    test('returns same team record with updated name', async () => {
        // @ts-ignore
        const mockRequest: APIGatewayProxyEvent = {
            httpMethod: "PUT",
            headers: {},
            requestContext: {
                authorizer: {
                    claims: {
                        sub: authUser.sub
                    }
                }
            },
            pathParameters: {
                id: team.id
            },
            body: JSON.stringify({
                name: 'Testing Team 123'
            })
        } as APIGatewayProxyEvent

        const req = await updateTeam(mockRequest)

        expect(req.statusCode).toBe(200)
        expect(JSON.parse(req.body).id).toBe(team.id)
        expect(JSON.parse(req.body).name).toBe('Testing Team 123')
    })
})