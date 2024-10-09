import { Hono } from 'hono'
import { z, ZodType } from 'zod'
import { entity, type Site } from '../entities/site'
import apiValidateAuthCookie from '../utils/apiValidateAuthCookie'
import type { User } from 'lucia'
import { createMiddleware } from 'hono/factory'
import { entity as userEntity } from "../entities/user"
import { entity as templateEntity, type Template } from "../entities/template"
import { zValidator } from '@hono/zod-validator'
import { SitesService } from '../entities/services/sites'
import { entity as componentEntity, createComponent, type Component } from '../entities/component'
// import { SitesService } from '../entities/services/sites'

function protectSiteRecordMiddleware(failedMessage: string) {
    return createMiddleware(async (c, next) => {

        const user = c.get("user")
        const siteId = c.req.param('siteId') as string

        if (!user || !user.sites?.includes(siteId)) {
            return c.json({
                message: failedMessage
            }, 403)
        }

        await next()
    })
}

const setSiteRecordMiddleware = createMiddleware(async (c, next) => {
    const siteId = c.req.param('siteId') as string
    const { data: site } = await entity.get({ siteId }).go()

    if (!site) {
        return c.json({
            message: "Cannot find site record"
        }, 404)
    }

    c.set("site", site)

    await next()
})

const sites = new Hono<{
    Variables: {
        site: Site,
        template: Template,
        user: User,
        component: Component
    }
}>()

// protect these routes
sites.use("*", apiValidateAuthCookie)
// sites targeting specific site inject site record to site var
sites.use("/:siteId/*", setSiteRecordMiddleware)

sites.get(
    "/",
    async (c) => {
        const user = c.get("user") as User

        if (!user.sites?.length) {
            return c.json([], 200)
        }

        const { data: sites } = await entity.get(
            // batch get query
            user.sites.map(site => ({ siteId: site }))
        ).go()

        return c.json(sites, 200)
    })

// /sites POST
sites.post(
    "/",
    zValidator("json", z.object({
        name: z.string()
    })),
    async (c) => {
        const { name } = c.req.valid("json")

        try {

            const { friendlySitesDomainGenerator } = await import('../utils/friendlySitesDomainGenerator')
            const domain = friendlySitesDomainGenerator()

            const { data: site } = await entity.create({
                name,
                domain,
            }).go()

            // add new site id to the user record as ownership signal
            const user = c.get("user")
            await userEntity.patch({ userId: user.userId }).append({ sites: [site.siteId] }).go()

            return c.json(site, 200)
        } catch (e: any) {
            return c.json(e, 500)
        }
    })

// /sites PATCH
sites.patch(
    "/:siteId",
    zValidator("json", z.object({
        name: z.string().optional()
    }).partial()),
    protectSiteRecordMiddleware('User cannot edit site record'),
    async (c) => {

        const patchObject = c.req.valid("json")
        const existingRecord = c.get("site")

        const updatedRecordCommand = entity.patch({ siteId: existingRecord.siteId })
            .set(patchObject)

        const updatedRecord = await updatedRecordCommand
            // should return full record
            .go({ response: "all_new" })

        return c.json(updatedRecord.data, 200)
    })

// /sites DELETE
sites.delete(
    "/:siteId",
    protectSiteRecordMiddleware('User cannot delete site record'),
    async (c) => {
        const siteId = c.req.param('siteId')
        const site = await entity.delete({ siteId }).go()

        return c.json(site, 200)
    })

// /sites GET
sites.get(
    "/:siteId",
    protectSiteRecordMiddleware('User cannot get site record'),
    async (c) => {
        const site = c.get("site")

        return c.json(site, 200)
    })

export default sites