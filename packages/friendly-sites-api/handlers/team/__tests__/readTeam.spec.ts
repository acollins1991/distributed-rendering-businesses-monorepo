import { describe, test, expect, beforeAll } from "bun:test"
import { entity as teamEntity } from "../../../entities/team"
import readTeam from "../readTeam"
import createAPIRequestEvent from "../../../factories/APIRequestEvent"
import createUserFactory from "../../../factories/User"

describe('readTeam', () => {

    let team
    const authUser = createUserFactory()

    beforeAll(async () => {
        const teamRes = await teamEntity.create({
            name: 'Team ' + crypto.randomUUID(),
            users: [authUser.id]
        }).go()

        team = teamRes.data
    })

    test('returns same team record', async () => {
        const mockRequest = createAPIRequestEvent('GET', authUser, '', { id: team.id })

        const req = await readTeam(mockRequest)

        expect(req.statusCode).toBe(200)
        expect(JSON.parse(req.body).id).toBe(team.id)
    })
})