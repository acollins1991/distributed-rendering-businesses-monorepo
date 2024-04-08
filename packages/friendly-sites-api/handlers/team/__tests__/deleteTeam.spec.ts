import { describe, test, expect, beforeAll } from "bun:test"
import { entity as teamEntity } from "../../../entities/team"
import deleteTeam from "../deleteTeam"
import createAPIRequestEvent from "../../../factories/APIRequestEvent";

describe('deleteTeam', () => {

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

    test('removes team record from db', async () => {
        const mockRequest = createAPIRequestEvent(
            'DELETE',
            authUser.sub,
            '',
            {
                id: team.id
            }
        )

        const req = await deleteTeam(mockRequest)

        expect(req.statusCode).toBe(200)
        // should return full record that has been deleted
        expect(JSON.parse(req.body)).toHaveProperty('id')
        expect(JSON.parse(req.body)).toHaveProperty('name')
        // expect no record to be returned
        expect(await teamEntity.get({ id: team.id }).go()).toMatchObject({ data: null })
    })
})