import { test, describe, expect, beforeAll } from "bun:test"
import { app } from ".."
import { entity } from "../entities/site"
import { mockDeep } from "vitest-mock-extended"
import type { LambdaBindings } from "../types"
import createUserFactory from "../factories/User"
import { createHostedZone } from "../utils/manageHostedZone"
import { friendlySitesDomainGenerator } from "../utils/friendlySitesDomainGenerator"
import type { Session } from "lucia"
import type { User } from "../entities/user"
import { entity as userEntity } from "../entities/user"

describe("/sites endpoints", () => {

    let databaseUser: User;
    let bearerToken: Session["id"];

    beforeAll(async () => {
        const { session, user } = await createUserFactory()
        databaseUser = user
        bearerToken = session.id
    })

    describe("POST", () => {
        test('request without name fails', async () => {
            const res = await app.request("/sites", {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({})
            }, {
                event: {
                    body: JSON.stringify({}),
                    headers: {
                        authorization: `Bearer ${bearerToken}`
                    }
                }
            })

            expect(res.status).toBe(400)
        })

        test('creates a new site record', async () => {
            const siteName = 'Tesing Site ' + crypto.randomUUID()

            const res = await app.request("/sites", {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({})
            }, {
                event: {
                    body: JSON.stringify({
                        name: siteName,
                    }),
                    headers: {
                        authorization: `Bearer ${bearerToken}`
                    }
                }
            })

            // check response
            expect(res.status).toBe(200)

            const siteRecord = await entity.find({ name: siteName }).go()

            expect(siteRecord.data[0].name).toBe(siteName)
            expect(siteRecord.data[0].hosted_zone).toBeString()
        })
    })

    describe("PATCH", () => {

        test('site id must be in user record for successful update', async () => {
            // preexisting setup hosted zone
            const hostedZone = await createHostedZone("dummydomain.co.uk")
            const siteName = 'Tesing Site ' + crypto.randomUUID()
            const { siteId } = await entity.create({ name: siteName, domain: 'dummydomain', hosted_zone: hostedZone.HostedZone?.Id as string }).go().then(res => res.data)

            // expect item to exist
            expect((await entity.get({ siteId }).go()).data).toBeTruthy()

            // update item
            const newSiteName = 'Tesing Site ' + crypto.randomUUID()
            const env = mockDeep<LambdaBindings>()
            env.event.body = JSON.stringify({
                name: siteName
            })
            const res = await app.request(`/sites/${siteId}`, {
                method: "PATCH",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({})
            }, {
                event: {
                    body: JSON.stringify({
                        name: newSiteName
                    }),
                    headers: {
                        authorization: `Bearer ${bearerToken}`
                    }
                }
            })

            expect(res.status).toBe(403)
        })

        test('updates the site record name', async () => {
            // preexisting setup hosted zone
            const hostedZone = await createHostedZone("dummydomain.co.uk")
            const siteName = 'Tesing Site ' + crypto.randomUUID()
            const { siteId } = await entity.create({ name: siteName, domain: 'dummydomain', hosted_zone: hostedZone.HostedZone?.Id as string }).go().then(res => res.data)
            // add siteId to user
            await userEntity.update({ userId: databaseUser.userId }).append({ sites: [siteId] }).go()

            // expect item to exist
            expect((await entity.get({ siteId }).go()).data).toBeTruthy()

            // update item
            const newSiteName = 'Tesing Site ' + crypto.randomUUID()
            const res = await app.request(`/sites/${siteId}`, {
                method: "PATCH",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({})
            }, {
                event: {
                    body: JSON.stringify({
                        name: newSiteName
                    }),
                    headers: {
                        authorization: `Bearer ${bearerToken}`
                    }
                }
            })

            expect(res.status).toBe(200)
            expect((await res.json()).name).toBe(newSiteName)

        })

        test('updates the site record domain', async () => {

            // preexisting setup hosted zone
            const hostedZone = await createHostedZone("dummydomain.co.uk")

            const siteName = 'Tesing Site ' + crypto.randomUUID()

            const { siteId } = await entity.create({ name: siteName, domain: "dummydomain.co.uk", hosted_zone: hostedZone.HostedZone?.Id as string }).go().then(res => res.data)
            // add siteId to user
            await userEntity.update({ userId: databaseUser.userId }).append({ sites: [siteId] }).go()

            // expect item to exist
            expect((await entity.get({ siteId }).go()).data).toBeTruthy()

            // update domain
            const newDomain = friendlySitesDomainGenerator()
            const res = await app.request(`/sites/${siteId}`, {
                method: "PATCH",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({})
            }, {
                event: {
                    body: JSON.stringify({
                        domain: newDomain
                    }),
                    headers: {
                        authorization: `Bearer ${bearerToken}`
                    }
                }
            })

            expect(res.status).toBe(200)
            expect((await res.json()).domain).toBe(newDomain)

        })
    })
    describe('DELETE', () => {
        test('deletes the site record', async () => {
            const siteName = 'Tesing Site ' + crypto.randomUUID()
            const { siteId } = await entity.create({ name: siteName, domain: 'dummydomain', hosted_zone: 'dummyhostedzoneid' }).go().then(res => res.data)
            // add siteId to user
            await userEntity.update({ userId: databaseUser.userId }).append({ sites: [siteId] }).go()

            // expect item to exist
            expect((await entity.get({ siteId }).go()).data).toBeTruthy()

            const res = await app.request(`/sites/${siteId}`, {
                method: "DELETE",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({})
            }, {
                event: {
                    headers: {
                        authorization: `Bearer ${bearerToken}`
                    }
                }
            })

            expect(res.status).toBe(200)
            expect((await entity.get({ siteId }).go()).data).toBeFalsy()

        })
    })

    describe('GET site record', () => {
        test('deletes the site record', async () => {
            const siteName = 'Tesing Site ' + crypto.randomUUID()
            const { siteId } = await entity.create({ name: siteName, domain: 'dummydomain', hosted_zone: 'dummyhostedzoneid' }).go().then(res => res.data)
            // add siteId to user
            await userEntity.update({ userId: databaseUser.userId }).append({ sites: [siteId] }).go()

            // expect item to exist
            expect((await entity.get({ siteId }).go()).data).toBeTruthy()

            const res = await app.request(`/sites/${siteId}`, {
                method: "GET",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({})
            }, {
                event: {
                    headers: {
                        authorization: `Bearer ${bearerToken}`
                    }
                }
            })

            expect(res.status).toBe(200)
            const json = await res.json()
            expect(json.siteId).toBe(siteId)
        })
    })
})