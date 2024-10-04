import { test, describe, expect, beforeAll, mock } from "bun:test"
import { mock as mockType } from "vitest-mock-extended"
import { entity, type Site } from "../entities/site"
import createUserFactory from "../factories/User"
import type { Session } from "lucia"
import type { User } from "../entities/user"
import { entity as userEntity } from "../entities/user"
import { entity as templateEntity, type Template } from "../entities/template"
import { entity as componentEntity, createComponent, type Component } from "../entities/component"
import { faker } from "@faker-js/faker"
import ApiRequestFactory from "../factories/ApiRequest"
import defaultTemplateContent from "../../utils/defaultTemplateContent"
import type { Distribution } from "@aws-sdk/client-cloudfront"

function createRandomPath() {
    return `/${faker.word.words(5).replaceAll(" ", "-")}`
}

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

            // site record should have a default template id that references a new template with default content
            const templateId = siteRecord.default_template
            const { data: template } = await templateEntity.get({ templateId }).go()
            expect(template).toBeTruthy()
            // expect(template?.content).toBe(defaultTemplateContent)

            // should have created 
        })

        // test('no two site records should occupy the same domain', async () => {
        //     const domain = `${crypto.randomUUID()}.com`
        //     // create existing site with domain
        //     await entity.create({ name: 'Unique Domain Site', domain, hosted_zone: 'dummyhostingzone', default_template: '' }).go()

        //     const res = await new ApiRequestFactory('/api/sites', {
        //         name: 'New Site',
        //         domain
        //     }).post.setAuthSession(bearerToken).go()

        //     expect(res.status).toBe(409)

        // })
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

        // test('updates the site record domain', async () => {

        //     // preexisting setup hosted zone
        //     const domain = `${crypto.randomUUID()}.com`
        //     const hostedZone = await createHostedZone(domain)

        //     const siteName = 'Tesing Site ' + crypto.randomUUID()

        //     const { siteId } = await entity.create({ name: siteName, domain, hosted_zone: hostedZone.HostedZone?.Id as string, default_template: '' }).go().then(res => res.data)
        //     // add siteId to user
        //     await userEntity.update({ userId: databaseUser.userId }).append({ sites: [siteId] }).go()

        //     // expect item to exist
        //     expect((await entity.get({ siteId }).go()).data).toBeTruthy()

        //     // update domain
        //     const newDomain = friendlySitesDomainGenerator()
        //     const res = await new ApiRequestFactory(`/api/sites/${siteId}`, {
        //         domain: newDomain
        //     }).patch.setAuthSession(bearerToken).go()

        //     expect(res.status).toBe(200)
        //     expect((await res.json()).domain).toBe(newDomain)

        // })
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

    //
    describe('/sites/:id/templates endpoints', () => {

        let databaseSite: Site;

        beforeAll(async () => {
            const res = await new ApiRequestFactory(`/api/sites`, {
                name: faker.word.words(4),
            }).post.setAuthSession(bearerToken).go()
            databaseSite = await res.json()
        })

        describe("POST", () => {

            test('creates a new template record', async () => {
                const templateName = 'Testing' + crypto.randomUUID()

                const res = await new ApiRequestFactory(`/api/sites/${databaseSite.siteId}/templates`, {
                    name: templateName,
                    path: createRandomPath()
                }).post.setAuthSession(bearerToken).go()

                expect(res.status).toBe(200)
                const { data: [templateRecord] } = await templateEntity.scan.where(({ name }, { eq }) => eq(name, templateName)).go()

                const json = await res.json()
                expect(json.name).toBe(templateName)
                expect(templateRecord).toBeTruthy()
            })

            test('new template records must have unique path values', async () => {

                // store path so we can test duplication
                const path = createRandomPath()

                await new ApiRequestFactory(`/api/sites/${databaseSite.siteId}/templates`, {
                    name: 'Testing' + crypto.randomUUID(),
                    path
                }).post.setAuthSession(bearerToken).go()

                // duplicate
                const templateName = 'Testing' + crypto.randomUUID()
                const res = await new ApiRequestFactory(`/api/sites/${databaseSite.siteId}/templates`, {
                    name: templateName,
                    path
                }).post.setAuthSession(bearerToken).go()

                expect(res.status).toBe(400)
                const { data: templates } = await templateEntity.scan.where(({ path: p }, { eq }) => eq(p, path)).go()

                expect(templates.length).toEqual(1)
            })

        })

        describe("GET", () => {

            test('gets first page of templates that belong to a site record', async () => {

                // create a new template
                // TODO: make template factory instead of request
                const templateName = 'Testing' + crypto.randomUUID()
                const templateRes = await new ApiRequestFactory(`/api/sites/${databaseSite.siteId}/templates`, {
                    name: templateName,
                    path: createRandomPath()
                }).post.setAuthSession(bearerToken).go()
                const template = await templateRes.json() as Template

                // get all tempaltes, should contain above 
                const res = await new ApiRequestFactory(`/api/sites/${databaseSite.siteId}/templates`).setAuthSession(bearerToken).go()

                expect(res.status).toBe(200)

                const json = await res.json()
                expect(json.data.find((templateRecord: Template) => templateRecord.templateId === template.templateId)).toBeTruthy()

            })

            test('gets as second page of templates that belong to a site record', async () => {

                // create 30 template records
                await templateEntity.put(
                    [...Array(30).keys()].map(number => {
                        return { name: `Template ${crypto.randomUUID()}`, siteId: databaseSite.siteId, path: '/' }
                    })
                ).go({ concurrency: 10 })

                // get first page
                const firstPageRes = await new ApiRequestFactory(`/api/sites/${databaseSite.siteId}/templates`).get.setAuthSession(bearerToken).go()
                const firstPageJson = await firstPageRes.json()
                // default per page is 10 so should get 10 results back
                expect(firstPageRes.status).toBe(200)
                expect(firstPageJson.data.length).toBe(10)

                // get second page
                const secondPageRes = await new ApiRequestFactory(`/api/sites/${databaseSite.siteId}/templates?cursor=${firstPageJson.cursor}`).get.setAuthSession(bearerToken).go()
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
                    { name: `Template ${crypto.randomUUID()}`, siteId: databaseSite.siteId, path: createRandomPath() }
                ).go()

                const res = await new ApiRequestFactory(`/api/sites/${databaseSite.siteId}/templates/${templateRecord.templateId}`).setAuthSession(bearerToken).go()

                expect(res.status).toBe(200)

                const template = await res.json()
                expect(template.name).toBe(templateRecord.name)
            })

            test('not existent template returns 404', async () => {

                const res = await new ApiRequestFactory(`/api/sites/${databaseSite.siteId}/templates/${crypto.randomUUID()}`).setAuthSession(bearerToken).go()

                expect(res.status).toBe(404)
                const json = await res.json()
                expect(json.message).toBe('Template not found')
            })

        })

        describe("PATCH", () => {

            test("update template name", async () => {

                // create template to test agains
                const { data: templateRecord } = await templateEntity.create(
                    { name: `Template ${crypto.randomUUID()}`, siteId: databaseSite.siteId, path: '/' }
                ).go()

                const newTemplateName = `Template ${crypto.randomUUID()}`

                const res = await new ApiRequestFactory(`/api/sites/${databaseSite.siteId}/templates/${templateRecord.templateId}`, {
                    name: newTemplateName,
                    path: createRandomPath()
                }).patch.setAuthSession(bearerToken).go()

                expect(res.status).toBe(200)

                const json = await res.json()
                expect(json.name).toBe(newTemplateName)

                const updatedRecord = await templateEntity.get({ templateId: templateRecord.templateId }).go()
                expect(updatedRecord.data?.name).toBe(newTemplateName)

            })

        })

        describe("DELETE", () => {

            test("deletes template record", async () => {
                // create template to test agains
                const { data: templateRecord } = await templateEntity.create(
                    { name: `Template ${crypto.randomUUID()}`, siteId: databaseSite.siteId, path: createRandomPath() }
                ).go()

                const res = await new ApiRequestFactory(`/api/sites/${databaseSite.siteId}/templates/${templateRecord.templateId}`).delete.setAuthSession(bearerToken).go()

                expect(res.status).toBe(200)

                const json = await res.json()
                expect(json.templateId).toBe(templateRecord.templateId)

                expect((await templateEntity.get({ templateId: templateRecord.templateId }).go()).data).toBeFalsy()
            })

        })
    })

    describe("/component endpoints", () => {

        let databaseSite: Site;

        beforeAll(async () => {
            const res = await new ApiRequestFactory(`/api/sites`, {
                name: faker.word.words(4),
            }).post.setAuthSession(bearerToken).go()
            databaseSite = await res.json()
        })

        describe("POST", () => {

            test("creates a component record", async () => {
                const componentData: Parameters<typeof createComponent>[1] = {
                    name: faker.word.words(4),
                    content: '<div>Testing testing testing</div>'
                }


                const res = await new ApiRequestFactory(`/api/sites/${databaseSite.siteId}/components`, componentData).post.setAuthSession(bearerToken).go()

                expect(res.status).toBe(200)

                const { data: [component] } = await componentEntity.query.bySiteId({ siteId: databaseSite.siteId }).go()

                expect(component).toBeTruthy()
            })

            test("cannot create a component with the same name", async () => {

                const componentData: Parameters<typeof createComponent>[1] = {
                    name: faker.word.words(4),
                    content: '<div>Testing testing testing</div>'
                }

                // create initial with same details
                await new ApiRequestFactory(`/api/sites/${databaseSite.siteId}/components`, componentData).post.setAuthSession(bearerToken).go()

                const res = await new ApiRequestFactory(`/api/sites/${databaseSite.siteId}/components`, componentData).post.setAuthSession(bearerToken).go()

                expect(res.status).toBe(400)

                const { data: components } = await componentEntity.query.bySiteId({ siteId: databaseSite.siteId }).where(({ name }, { eq }) => eq(name, componentData.name)).go()

                expect(components.length).not.toBeGreaterThan(1)
            })

        })

        describe("GET list", () => {

            // test("creates a component record", async () => {
            //     const componentData: Parameters<typeof createComponent>[1] = {
            //         name: 'Testing component',
            //         content: '<div>Testing testing testing</div>'
            //     }


            //     const res = await new ApiRequestFactory(`/api/sites/${databaseSite.siteId}/components`, componentData).post.setAuthSession(bearerToken).go() 

            //     expect(res.status).toBe(200)

            //     const { data: [component] } = await componentEntity.query.bySiteId({ siteId: databaseSite.siteId }).go()

            //     expect(component).toBeTruthy()
            // })

            test('gets first page of components that belong to a site record', async () => {

                // create a new site to test against
                const siteRes = await new ApiRequestFactory(`/api/sites`, {
                    name: faker.word.words(4),
                }).post.setAuthSession(bearerToken).go()
                const site = await siteRes.json()

                const componentData: Parameters<typeof createComponent>[1] = {
                    name: faker.word.words(4),
                    content: '<div>Testing testing testing</div>'
                }

                // create a new template
                const componentsRes = await new ApiRequestFactory(`/api/sites/${site.siteId}/components`, componentData).post.setAuthSession(bearerToken).go()
                const component = await componentsRes.json() as Component

                // get all tempaltes, should contain above 
                const res = await new ApiRequestFactory(`/api/sites/${site.siteId}/components`).setAuthSession(bearerToken).go()

                expect(res.status).toBe(200)

                const json = await res.json()
                expect(json.data.find((c: Component) => c.componentId === component.componentId)).toBeTruthy()

            })

            test('gets as second page of components that belong to a site record', async () => {

                // create a new site to test against
                const siteRes = await new ApiRequestFactory(`/api/sites`, {
                    name: faker.word.words(4),
                }).post.setAuthSession(bearerToken).go()
                const site = await siteRes.json()

                // create 30 template records
                await componentEntity.put(
                    [...Array(30).keys()].map(_ => {
                        return { name: `Component ${crypto.randomUUID()}`, siteId: site.siteId, content: '<div></div>' }
                    })
                ).go({ concurrency: 10 })

                // get first page
                const firstPageRes = await new ApiRequestFactory(`/api/sites/${site.siteId}/components`).get.setAuthSession(bearerToken).go()
                const firstPageJson = await firstPageRes.json()
                // default per page is 10 so should get 10 results back
                expect(firstPageRes.status).toBe(200)
                expect(firstPageJson.data.length).toBe(10)

                // get second page
                const secondPageRes = await new ApiRequestFactory(`/api/sites/${site.siteId}/components?cursor=${firstPageJson.cursor}`).get.setAuthSession(bearerToken).go()
                // default per page is 10 so should get 10 results back
                const secondPageJson = await secondPageRes.json()
                expect(secondPageJson.data.length).toBe(10)
                // confirm results are not the same
                expect(secondPageJson.data).not.toEqual(firstPageJson.data)
            })

        })

        describe("GET specific", () => {

            test("gets a specific component", async () => {

                const componentData: Parameters<typeof createComponent>[1] = {
                    name: faker.word.words(4),
                    content: '<div>Testing testing testing</div>'
                }

                const { data: component } = await createComponent(databaseSite.siteId, componentData)

                const res = await new ApiRequestFactory(`/api/sites/${databaseSite.siteId}/components/${component.componentId}`).get.setAuthSession(bearerToken).go()

                expect(res.status).toBe(200)

                const componentRes = await res.json() as Component

                expect(componentRes.componentId).toBe(component.componentId)
            })

        })

    })
})