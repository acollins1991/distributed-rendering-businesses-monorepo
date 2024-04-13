import { describe, test, expect } from "bun:test"
import createAPIRequestEvent from "../../../factories/APIRequestEvent"
import createUserFactory from "../../../factories/User"
import deleteSite from "../deleteSite"
import { entity as siteEntity } from "../../../entities/site"

describe('deleteSite', () => {

    test('deletes the site record', async () => {

        const siteName = 'Tesing Site ' + crypto.randomUUID()
        const teamId = crypto.randomUUID()

        const { siteId } = await siteEntity.create({ name: siteName, teamId }).go().then(res => res.data)

        const mockRequest = createAPIRequestEvent('DELETE', createUserFactory(), JSON.stringify({
            siteId: siteId
        }))

        // expect item to exist
        expect((await siteEntity.get({ siteId }).go()).data).toBeTruthy()
        // delete item
        const response = await deleteSite(mockRequest)

        expect(response.statusCode).toBe(200)
        expect((await siteEntity.get({ siteId }).go()).data).toBeFalsy()

    })
})