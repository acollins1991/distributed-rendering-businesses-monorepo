import { test, describe, expect, beforeAll } from "bun:test"
import { type Site } from "../entities/site"
import createUserFactory from "../factories/User"
import type { Session } from "lucia"
import { entity as componentEntity, createComponent, type Component } from "../entities/component"
import { faker } from "@faker-js/faker"
import ApiRequestFactory from "../factories/ApiRequest"

describe("/sites/:siteId/components endpoints", () => {

    let databaseSite: Site;
    let bearerToken: Session["id"];

    beforeAll(async () => {
        const { session, user } = await createUserFactory()
        bearerToken = session.id

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