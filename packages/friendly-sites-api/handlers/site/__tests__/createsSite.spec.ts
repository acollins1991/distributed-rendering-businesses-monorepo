import { describe, test, expect } from "bun:test"
import createAPIRequestEvent from "../../../factories/APIRequestEvent"
import createUserFactory from "../../../factories/User"
import createSite from "../createSite"
import { entity as siteEntity } from "../../../entities/site"

describe('createSite', () => {

    test('creates a new site record', async () => {

        const siteName = 'Tesing Site ' + crypto.randomUUID()
        const teamId = crypto.randomUUID()

        const mockRequest = createAPIRequestEvent('POST', createUserFactory(), JSON.stringify({
            name: siteName,
            teamId
        }))

        await createSite(mockRequest)

        const siteRecord = await siteEntity.find({ name: siteName, teamId }).go()

        expect(siteRecord.data[0].name).toBe(siteName)
        expect(siteRecord.data[0].hosted_zone).toBeString()

    })
})