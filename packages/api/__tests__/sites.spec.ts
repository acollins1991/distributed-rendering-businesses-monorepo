import { test, describe, expect, beforeAll, mock } from "bun:test"
import { mock as mockType } from "vitest-mock-extended"
import { entity, type Site } from "../entities/site"
import createUserFactory from "../factories/User"
import type { Session } from "lucia"
import type { User } from "../entities/user"
import { entity as userEntity } from "../entities/user"
import { faker } from "@faker-js/faker"
import ApiRequestFactory from "../factories/ApiRequest"
import type { Distribution } from "@aws-sdk/client-cloudfront"

describe("/sites endpoints", () => {

    let databaseUser: User;
    let bearerToken: Session["id"];

    beforeAll(async () => {

        // mock cloudfront distribution retrieval
        mock.module('../utils/taggedResources', () => {
            const dummyDistribution: Distribution = Object.assign({}, mockType<Distribution>(), {
                DomainName: 'cloudfrontdistribution.com'
            })
            return {
                async getDefaultCloudfrontDistribution(): Promise<Distribution> {
                    return dummyDistribution
                }
            }
        })

        const { session, user } = await createUserFactory()
        databaseUser = user
        bearerToken = session.id
    })

    describe("POST", () => {
        test('request without name fails', async () => {
            const res = await new ApiRequestFactory("/api/sites", {}).post.setAuthSession(bearerToken).go()

            expect(res.status).toBe(400)
        })

        test('creates a new site record with subdomain type, add adds dns record', async () => {
            const newSiteName = 'Tesing Site' + crypto.randomUUID()

            const res = await new ApiRequestFactory("/api/sites", {
                name: newSiteName,
            }).setAuthSession(bearerToken).post.go()

            // check response
            expect(res.status).toBe(200)

            const { data: [siteRecord] } = await entity.scan.where(({ name }, { eq }) => eq(name, newSiteName)).go()

            expect(siteRecord.name).toBe(newSiteName)

            // siteId should now be in the user record
            const refreshedUserRecord = await userEntity.get({ userId: databaseUser.userId }).go()
            expect(refreshedUserRecord.data?.sites).toContain(siteRecord.siteId)

        })
        
    })

    describe("PATCH", () => {

        test('site id must be in user record for successful update', async () => {
            // create site with different auth user
            const siteName = 'Tesing Site ' + crypto.randomUUID()
            const existingSiteRes = await new ApiRequestFactory(`/api/sites`, {
                name: siteName
            }).post.addAuthSession().go()

            const existingSite = await existingSiteRes.json()

            // expect item to exist
            expect((await entity.get({ siteId: existingSite.siteId }).go()).data).toBeTruthy()

            // update item
            const res = await new ApiRequestFactory(`/api/sites/${existingSite.siteId}`, {
                name: 'Tesing Site ' + crypto.randomUUID()
            }).patch.setAuthSession(bearerToken).go()

            expect(res.status).toBe(403)
        })

        test('updates the site record name', async () => {
            // preexisting setup hosted zone
            const existingSiteRes = await new ApiRequestFactory(`/api/sites`, {
                name: `Existing Site ${crypto.randomUUID()}`
            }).post.setAuthSession(bearerToken).go()

            const existingSite = await existingSiteRes.json()

            // expect item to exist
            expect((await entity.get({ siteId: existingSite.siteId }).go()).data).toBeTruthy()

            // update item
            const newSiteName = 'Tesing Site ' + crypto.randomUUID()
            const res = await new ApiRequestFactory(`/api/sites/${existingSite.siteId}`, {
                name: newSiteName
            }).patch.setAuthSession(bearerToken).go()

            expect(res.status).toBe(200)
            expect((await res.json()).name).toBe(newSiteName)

        })

    })
    describe('DELETE', () => {
        test('deletes the site record', async () => {
            const siteName = 'Tesing Site ' + crypto.randomUUID()
            const existingSiteRes = await new ApiRequestFactory(`/api/sites`, {
                name: siteName
            }).post.setAuthSession(bearerToken).go()

            const existingSite = await existingSiteRes.json()

            // expect item to exist
            expect((await entity.get({ siteId: existingSite.siteId }).go()).data).toBeTruthy()
            const res = await new ApiRequestFactory(`/api/sites/${existingSite.siteId}`).delete.setAuthSession(bearerToken).go()

            expect(res.status).toBe(200)
            expect((await entity.get({ siteId: existingSite.siteId }).go()).data).toBeFalsy()

        })
    })

    describe('GET site record', () => {
        test('gets the site record', async () => {
            const siteName = 'Tesing Site ' + crypto.randomUUID()
            const existingSiteRes = await new ApiRequestFactory(`/api/sites`, {
                name: siteName
            }).post.setAuthSession(bearerToken).go()

            const existingSite = await existingSiteRes.json()

            // expect item to exist
            expect((await entity.get({ siteId: existingSite.siteId }).go()).data).toBeTruthy()
            const res = await new ApiRequestFactory(`/api/sites/${existingSite.siteId}`).get.setAuthSession(bearerToken).go()

            expect(res.status).toBe(200)
            const json = await res.json()
            expect(json.siteId).toBe(existingSite.siteId)
        })
    })

    describe("GET list sites", () => {

        let scopedDatabaseUser: User
        let scopedDatabaseUserBearerToken: string

        beforeAll(async () => {
            const { user, session } = await createUserFactory()
            scopedDatabaseUser = user
            scopedDatabaseUserBearerToken = session.id
        })

        test('gets a list of sites from users account', async () => {
            const sites = await Promise.all([1, 2].map(async () => {
                return new ApiRequestFactory(`/api/sites`, {
                    name: faker.word.words(4),
                    domain: `${crypto.randomUUID()}.com`
                }).post.setAuthSession(scopedDatabaseUserBearerToken).go().then(async (r) => {
                    const json = await r.json()
                    return json
                })
            }))
            expect(sites.length).toBe(2)

            const res = await new ApiRequestFactory(`/api/sites`, {
                name: faker.word.words(4),
            }).get.setAuthSession(scopedDatabaseUserBearerToken).go()

            expect(res.status).toBe(200)

            const json = await res.json()
            sites.forEach(site => {
                expect(json.find((record: Site) => site.siteId === record.siteId)).toBeTruthy()
            })
        })
    })
})