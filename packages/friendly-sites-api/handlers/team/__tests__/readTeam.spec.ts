import { describe, test, expect, beforeAll } from "bun:test"
import { entity as teamEntity } from "../../../entities/team"
import readTeam from "../readTeam"
import type { APIGatewayProxyEvent } from "aws-lambda"
import createAPIRequestEvent from "../../../factories/APIRequestEvent"

describe('readTeam', () => {

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
        const mockRequest = createAPIRequestEvent('GET', authUser.sub, '', { id: team.id })

        const req = await readTeam(mockRequest)

        expect(req.statusCode).toBe(200)
        expect(JSON.parse(req.body).id).toBe(team.id)
    })
})