import { describe, test, expect, beforeAll } from "bun:test"
import createAPIRequestEvent from "../../../factories/APIRequestEvent"
import createUserFactory from "../../../factories/User"
import { entity as siteEntity } from "../../../entities/site"
import updateSite from "../updateSite"
import { createHostedZone } from "../../../utils/manageHostedZone"
import { friendlySitesDomainGenerator } from "../../../utils/friendlySitesDomainGenerator"

describe('updateSite', () => {

    test('updates the site record name', async () => {

        // preexisting setup hosted zone
        const hostedZone = await createHostedZone("dummydomain.co.uk")

        const siteName = 'Tesing Site ' + crypto.randomUUID()
        const teamId = crypto.randomUUID()

        const { siteId } = await siteEntity.create({ name: siteName, teamId, domain: 'dummydomain', hosted_zone: hostedZone.HostedZone?.Id as string }).go().then(res => res.data)

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

    test('updates the site record domain', async () => {

        // preexisting setup hosted zone
        const hostedZone = await createHostedZone("dummydomain.co.uk")

        const siteName = 'Tesing Site ' + crypto.randomUUID()
        const teamId = crypto.randomUUID()

        const { siteId } = await siteEntity.create({ name: siteName, teamId, domain: "dummydomain.co.uk", hosted_zone: hostedZone.HostedZone?.Id as string }).go().then(res => res.data)

        const newDomain = friendlySitesDomainGenerator()
        const mockRequest = createAPIRequestEvent('PUT', createUserFactory(), JSON.stringify({
            domain: newDomain
        }), {
            id: siteId
        })

        // expect item to exist
        expect((await siteEntity.get({ siteId }).go()).data).toBeTruthy()
        // delete item
        const response = await updateSite(mockRequest)

        expect(response.statusCode).toBe(200)
        expect(JSON.parse(response.body).domain).toBe(newDomain)

    })
})