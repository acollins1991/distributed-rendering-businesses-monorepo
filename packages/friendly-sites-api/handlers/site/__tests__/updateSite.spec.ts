import { describe, test, expect } from "bun:test"
import createAPIRequestEvent from "../../../factories/APIRequestEvent"
import createUserFactory from "../../../factories/User"
import { entity as siteEntity } from "../../../entities/site"
import updateSite from "../updateSite"

describe('updateSite', () => {

    test('updates the site record name', async () => {

        const siteName = 'Tesing Site ' + crypto.randomUUID()
        const teamId = crypto.randomUUID()

        const { siteId } = await siteEntity.create({ name: siteName, teamId, domain: 'dummydomain', hosted_zone: 'dummyhostedzoneid' }).go().then(res => res.data)

        const newSiteName = 'Tesing Site ' + crypto.randomUUID()
        const mockRequest = createAPIRequestEvent('PUT', createUserFactory(), JSON.stringify({
            name: newSiteName
        }), {
            id: siteId
        })

        // expect item to exist
        expect((await siteEntity.get({ siteId }).go()).data).toBeTruthy()
        // delete item
        const response = await updateSite(mockRequest)

        expect(response.statusCode).toBe(200)
        expect(JSON.parse(response.body).name).toBe(newSiteName)

    })
})