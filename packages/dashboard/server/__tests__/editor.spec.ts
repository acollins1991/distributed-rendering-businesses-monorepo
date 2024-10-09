import { test, describe, expect, beforeAll } from "bun:test"
import { updateGrapeJsProjectData, type Site } from "../entities/site"
import createUserFactory from "../factories/User"
import type { Session } from "lucia"
import { entity as componentEntity, createComponent, getComponent, type Component } from "../entities/component"
import { faker } from "@faker-js/faker"
import ApiRequestFactory from "../factories/ApiRequest"
import grapesjs, { type Editor, type ProjectData } from 'grapesjs';

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

    describe("GET /", () => {

        test("retrieves the site data", async () => {

            const updateData: ProjectData = {"id": databaseSite.siteId, "data": {"assets": [], "styles": [], "pages": [{"component": "<div>Initial content</div>"}]} }
            await updateGrapeJsProjectData(databaseSite.siteId, updateData)

            const res = await new ApiRequestFactory(`/api/sites/${databaseSite.siteId}/editor`).get.setAuthSession(bearerToken).go()

            expect(res.status).toBe(200)
            expect(await res.json()).toEqual(updateData)
        })

    })

    describe("POST /", () => {

        test("updates the site data", async () => {

            const updateData: ProjectData = {"id": databaseSite.siteId, "data": {"assets": [], "styles": [], "pages": [{"component": "<div>Updated Content</div>"}]} }

            const res = await new ApiRequestFactory(`/api/sites/${databaseSite.siteId}/editor`, updateData).post.setAuthSession(bearerToken).go()

            expect(res.status).toBe(200)
            const json = await res.json()
            expect(json).toEqual(updateData)
        })

    })

})