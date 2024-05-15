import { test, describe, expect, beforeAll } from "bun:test"
import { app } from ".."
import { entity, type Site } from "../entities/site"
import { mockDeep } from "vitest-mock-extended"
import type { LambdaBindings } from "../types"
import createUserFactory from "../factories/User"
import { createHostedZone } from "../utils/manageHostedZone"
import { friendlySitesDomainGenerator } from "../utils/friendlySitesDomainGenerator"
import type { Session } from "lucia"
import type { User } from "../entities/user"
import { entity as userEntity } from "../entities/user"
import { entity as templateEntity, type Template } from "../entities/template"
import { faker } from "@faker-js/faker"

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
            const newSiteName = 'Tesing Site' + crypto.randomUUID()

            const res = await app.request("/sites", {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({})
            }, {
                event: {
                    body: JSON.stringify({
                        name: newSiteName,
                    }),
                    headers: {
                        authorization: `Bearer ${bearerToken}`
                    }
                }
            })

            // check response
            expect(res.status).toBe(200)

            const siteRecord = await entity.scan.where(({ name }, { eq }) => eq(name, newSiteName)).go()

            expect(siteRecord.data[0].name).toBe(newSiteName)
            expect(siteRecord.data[0].hosted_zone).toBeString()

            // siteId should now be in the user record
            const refreshedUserRecord = await userEntity.get({ userId: databaseUser.userId }).go()
            expect(refreshedUserRecord.data?.sites).toContain(siteRecord.data[0].siteId)
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

    //
    describe('/sites/:id/templates endpoints', () => {

        let databaseSite: Site;

        beforeAll(async () => {
            const res = await app.request("/sites", {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({})
            }, {
                event: {
                    body: JSON.stringify({
                        name: faker.word.words(4),
                    }),
                    headers: {
                        authorization: `Bearer ${bearerToken}`
                    }
                }
            })

            databaseSite = await res.json()
        })

        describe("POST", () => {

            test('creates a new template record', async () => {
                const templateName = 'Testing' + crypto.randomUUID()

                const res = await app.request(`/sites/${databaseSite.siteId}/templates`, {
                    method: "POST",
                    headers: {
                        "content-type": "application/json"
                    },
                    body: JSON.stringify({})
                }, {
                    event: {
                        body: JSON.stringify({
                            name: templateName,
                        }),
                        headers: {
                            authorization: `Bearer ${bearerToken}`
                        }
                    }
                })


                const json = await res.json()
                const { data: [templateRecord] } = await templateEntity.scan.where(({ name }, { eq }) => eq(name, templateName)).go()

                expect(res.status).toBe(200)
                expect(json.name).toBe(templateName)
                expect(templateRecord).toBeTruthy()
            })

        })

        describe("GET", () => {

            test('gets first page of templates that belong to a site record', async () => {

                // create a new template
                // TODO: make template factory instead of request
                const templateName = 'Testing' + crypto.randomUUID()
                const templateRes = await app.request(`/sites/${databaseSite.siteId}/templates`, {
                    method: "POST",
                    headers: {
                        "content-type": "application/json"
                    },
                    body: JSON.stringify({})
                }, {
                    event: {
                        body: JSON.stringify({
                            name: templateName,
                        }),
                        headers: {
                            authorization: `Bearer ${bearerToken}`
                        }
                    }
                })
                const template = await templateRes.json() as Template

                // get all tempaltes, should contain above 
                const res = await app.request(`/sites/${databaseSite.siteId}/templates`, {
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
                expect(json.data.find((templateRecord: Template) => templateRecord.templateId === template.templateId)).toBeTruthy()

            })

            test('gets as second page of templates that belong to a site record', async () => {

                // create 30 template records
                await templateEntity.put(
                    [...Array(30).keys()].map(number => {
                        return { name: `Template ${crypto.randomUUID()}`, siteId: databaseSite.siteId }
                    })
                ).go({ concurrency: 10 })

                // get first page
                const firstPageRes = await app.request(`/sites/${databaseSite.siteId}/templates`, {
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
                const firstPageJson = await firstPageRes.json()
                // default per page is 10 so should get 10 results back
                expect(firstPageJson.data.length).toBe(10)

                // get second page
                const secondPageRes = await app.request(`/sites/${databaseSite.siteId}/templates`, {
                    method: "GET",
                    headers: {
                        "content-type": "application/json"
                    },
                    body: JSON.stringify({})
                }, {
                    event: {
                        headers: {
                            authorization: `Bearer ${bearerToken}`
                        },
                        queryStringParameters: {
                            cursor: firstPageJson.cursor
                        }
                    }
                })
                // default per page is 10 so should get 10 results back
                const secondPageJson = await secondPageRes.json()
                expect(secondPageJson.data.length).toBe(10)
                // confirm results are not the same
                expect(secondPageJson.data).not.toEqual(firstPageJson.data)
            })

        })

        describe("GET specific template", () => {

            test('get specific template record', async () => {

                // create template to test agains
                const { data: templateRecord } = await templateEntity.create(
                    { name: `Template ${crypto.randomUUID()}`, siteId: databaseSite.siteId }
                ).go()

                const res = await app.request(`/sites/${databaseSite.siteId}/templates/${templateRecord.templateId}`, {
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

                const { data: template } = await res.json()
                expect(template.name).toBe(templateRecord.name)
            })

            test('not existent template returns 404', async () => {

                const res = await app.request(`/sites/${databaseSite.siteId}/templates/${crypto.randomUUID()}`, {
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

                expect(res.status).toBe(404)
                const json = await res.json()
                expect(json.message).toBe('Template not found')
            })

        })

        describe("PATCH", () => {

            test("update template name", async () => {

                // create template to test agains
                const { data: templateRecord } = await templateEntity.create(
                    { name: `Template ${crypto.randomUUID()}`, siteId: databaseSite.siteId }
                ).go()

                const newTemplateName = `Template ${crypto.randomUUID()}`

                const res = await app.request(`/sites/${databaseSite.siteId}/templates/${templateRecord.templateId}`, {
                    method: "PATCH",
                    headers: {
                        "content-type": "application/json"
                    },
                    body: JSON.stringify({})
                }, {
                    event: {
                        headers: {
                            authorization: `Bearer ${bearerToken}`
                        },
                        body: JSON.stringify({
                            name: newTemplateName
                        })
                    }
                })

                expect(res.status).toBe(200)

                const json = await res.json()
                expect(json.data.name).toBe(newTemplateName)

                const { data: updatedRecord } = await templateEntity.get({ templateId: templateRecord.templateId }).go()
                expect(updatedRecord?.name).toBe(newTemplateName)

            })

        })

        describe("DELETE", () => {

            test("deletes template record", async () => {
                // create template to test agains
                const { data: templateRecord } = await templateEntity.create(
                    { name: `Template ${crypto.randomUUID()}`, siteId: databaseSite.siteId }
                ).go()

                const res = await app.request(`/sites/${databaseSite.siteId}/templates/${templateRecord.templateId}`, {
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

                const json = await res.json()
                expect(json.data.templateId).toBe(templateRecord.templateId)

                expect((await templateEntity.get({ templateId: templateRecord.templateId }).go()).data).toBeFalsy()
            })

        })
    })
})