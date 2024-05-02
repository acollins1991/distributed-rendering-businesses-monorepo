import { test, describe, expect } from "bun:test"
import { app } from ".."
import { entity } from "../entities/site"
import { mockDeep } from "vitest-mock-extended"
import type { LambdaBindings } from "../types"
import createUserFactory from "../factories/User"
import { createHostedZone } from "../utils/manageHostedZone"
import { friendlySitesDomainGenerator } from "../utils/friendlySitesDomainGenerator"

describe("/sites endpoints", () => {
    describe("POST", () => {
        test('creates a new site record', async () => {
            const siteName = 'Tesing Site ' + crypto.randomUUID()
            const teamId = crypto.randomUUID()
            const authUser = createUserFactory()

            const env = mockDeep<LambdaBindings>()
            env.event.body = JSON.stringify({
                name: siteName,
                teamId
            })

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
                        teamId
                    }),
                    requestContext: {
                        authorizer: {
                            claims: {
                                sub: authUser.id
                            }
                        }
                    }
                }
            })

            // check response
            expect(res.status).toBe(200)

            const siteRecord = await entity.find({ name: siteName, teamId }).go()

            expect(siteRecord.data[0].name).toBe(siteName)
            expect(siteRecord.data[0].hosted_zone).toBeString()
        })
    })
    describe("PATCH", () => {
        test('updates the site record name', async () => {

            const authUser = createUserFactory()

            // preexisting setup hosted zone
            const hostedZone = await createHostedZone("dummydomain.co.uk")

            const siteName = 'Tesing Site ' + crypto.randomUUID()
            const teamId = crypto.randomUUID()

            const { siteId } = await entity.create({ name: siteName, teamId, domain: 'dummydomain', hosted_zone: hostedZone.HostedZone?.Id as string }).go().then(res => res.data)

            // expect item to exist
            expect((await entity.get({ siteId }).go()).data).toBeTruthy()

            // update item
            const newSiteName = 'Tesing Site ' + crypto.randomUUID()
            const env = mockDeep<LambdaBindings>()
            env.event.body = JSON.stringify({
                name: siteName,
                teamId
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
                    requestContext: {
                        authorizer: {
                            claims: {
                                sub: authUser.id
                            }
                        }
                    }
                }
            })

            expect(res.status).toBe(200)
            expect((await res.json()).name).toBe(newSiteName)

        })

        test('updates the site record domain', async () => {

            const authUser = createUserFactory()

            // preexisting setup hosted zone
            const hostedZone = await createHostedZone("dummydomain.co.uk")

            const siteName = 'Tesing Site ' + crypto.randomUUID()
            const teamId = crypto.randomUUID()

            const { siteId } = await entity.create({ name: siteName, teamId, domain: "dummydomain.co.uk", hosted_zone: hostedZone.HostedZone?.Id as string }).go().then(res => res.data)

            // expect item to exist
            expect((await entity.get({ siteId }).go()).data).toBeTruthy()

            // update domain
            const newDomain = friendlySitesDomainGenerator()
            const env = mockDeep<LambdaBindings>()
            env.event.body = JSON.stringify({
                name: siteName,
                teamId
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
                        domain: newDomain
                    }),
                    requestContext: {
                        authorizer: {
                            claims: {
                                sub: authUser.id
                            }
                        }
                    }
                }
            })

            expect(res.status).toBe(200)
            expect((await res.json()).domain).toBe(newDomain)

        })
    })
    describe('DELETE', () => {
        test('deletes the site record', async () => {


            const authUser = createUserFactory()

            const siteName = 'Tesing Site ' + crypto.randomUUID()
            const teamId = crypto.randomUUID()

            const { siteId } = await entity.create({ name: siteName, teamId, domain: 'dummydomain', hosted_zone: 'dummyhostedzoneid' }).go().then(res => res.data)

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
                    requestContext: {
                        authorizer: {
                            claims: {
                                sub: authUser.id
                            }
                        }
                    }
                }
            })

            expect(res.status).toBe(200)
            expect((await entity.get({ siteId }).go()).data).toBeFalsy()

        })
    })
})