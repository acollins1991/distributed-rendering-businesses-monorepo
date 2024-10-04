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

describe("/sites/:id/templates endpoints", () => {

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

        const { session } = await createUserFactory()
        bearerToken = session.id
    })

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

        test("content updates must check if a component is used within the content", async () => {

            // create component and template to test against
            const { data: component } = await createComponent(databaseSite.siteId, { name: `Component ${faker.word.words(4)}`, content: "<div></div>" })
            const { data: templateRecord } = await templateEntity.create(
                {
                    name: `Template ${crypto.randomUUID()}`, siteId: databaseSite.siteId, path: '/',
                    // register component but do not add to content
                    registered_components: [component.componentId]
                }
            ).go()

            const res = await new ApiRequestFactory(`/api/sites/${databaseSite.siteId}/templates/${templateRecord.templateId}`, {
                content: "<div>no components here</div>"
            }).patch.setAuthSession(bearerToken).go()

            console.log(await res.text())

            expect(res.status).toBe(400)
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