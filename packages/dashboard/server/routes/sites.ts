import { Hono } from 'hono'
import { z } from 'zod'
import { friendlySitesDomainGenerator } from '../utils/friendlySitesDomainGenerator'
import { createHostedZone, deleteHostedZone } from '../utils/manageHostedZone'
import { entity, type Site } from '../entities/site'
import apiValidateBearerTokenMiddleware from '../utils/apiValidateBearerTokenMiddleware'
import type { User } from 'lucia'
import { createMiddleware } from 'hono/factory'
import { entity as userEntity } from "../entities/user"
import { entity as templateEntity, type Template } from "../entities/template"
import { zValidator } from '@hono/zod-validator'

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
        user: User
    }
}>()

// protect these routes
sites.use("*", apiValidateBearerTokenMiddleware)
// sites targeting specific site inject site record to site var
sites.use("/:siteId/*", setSiteRecordMiddleware)

// /sites POST
sites.post(
    "/",
    zValidator("json", z.object({
        name: z.string(),
        domain: z.string().optional()
    })),
    async (c) => {
        const { name, domain: reqDomain } = c.req.valid("json")

        const domain = reqDomain ? reqDomain : friendlySitesDomainGenerator()
        const hostedZone = await createHostedZone(domain)

        try {
            const site = await entity.create({
                name,
                domain,
                hosted_zone: hostedZone.HostedZone?.Id as string
            }).go()

            // add new site id to the user record as ownership signal
            const user = c.get("user")
            await userEntity.patch({ userId: user.userId }).append({ sites: [site.data.siteId] }).go()

            return c.json(site.data, 200)
        } catch (e) {
            return c.json(e, 500)
        }
    })

// /sites PATCH
sites.patch(
    "/:siteId",
    zValidator("json", z.object({
        name: z.string().optional(),
        domain: z.string().optional()
    }).partial()),
    protectSiteRecordMiddleware('User cannot edit site record'),
    async (c) => {

        const patchObject = c.req.valid("json")
        const existingRecord = c.get("site")

        const updatedRecordCommand = entity.patch({ siteId: existingRecord.siteId })
            .set(patchObject)

        // if domain has changed update with new zone
        if (patchObject.domain && patchObject.domain !== existingRecord?.domain) {
            await deleteHostedZone(existingRecord.hosted_zone)
            const newHostedZone = await createHostedZone(patchObject.domain)
            updatedRecordCommand.set({
                hosted_zone: newHostedZone.HostedZone?.Id
            })
        }

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

// setup nested templates

const injectExistingTemplate = createMiddleware(async (c, next) => {
    const templateId = c.req.param('templateId') as string
    try {
        const { data: template } = await templateEntity.get({ templateId }).go()

        if (!template) {
            return c.json({
                message: "Template not found"
            }, 404)
        }

        c.set("template", template)

        await next()
    } catch (e) {
        return c.json(e, 500)
    }
})

// inject existing template as template var, or if not found throw 404 with message
sites.use("/:siteId/templates/:templateId/*", injectExistingTemplate)

sites.post(
    "/:siteId/templates",
    zValidator("json", z.object({
        name: z.string()
    })),
    async (c) => {
        const site = c.get("site")
        const { name } = c.req.valid("json")

        try {

            const { data: template } = await templateEntity.create({
                name,
                siteId: site.siteId
            }).go()

            return c.json(template, 200)
        } catch (e) {
            return c.json(e, 500)
        }
    })

// list
sites.get(
    "/:siteId/templates",
    async (c) => {
        const site = c.get("site")

        const query = z.object({
            cursor: z.string(),
            perPage: z.number()
        }).partial().parse(c.req.query())

        const executionArgs = {
            cursor: query.cursor ?? null,
            limit: query.perPage ?? 10
        }

        try {
            const { data: templates, cursor } = await templateEntity.query.bySiteId({ siteId: site.siteId }).go(executionArgs)

            return c.json({
                data: templates,
                cursor: cursor,
                links: {
                    nextPage: `${c.req.path}?cursor=${cursor}`
                }
            }, 200)
        } catch (e) {
            return c.json(e, 500)
        }
    })

sites.get(
    "/:siteId/templates/:templateId",
    async (c) => {
        try {
            const template = c.get("template") as Template
            return c.json({
                data: template
            }, 200)
        } catch (e) {
            return c.json(e, 500)
        }
    })

sites.patch(
    "/:siteId/templates/:templateId",
    zValidator("json", z.object({
        name: z.string().optional()
    })),
    async (c) => {
        const { templateId } = c.get("template") as Template
        const patchObject = c.req.valid("json")
        try {
            const { data: template } = await templateEntity.patch({ templateId }).set(patchObject).go({ response: "all_new" })
            return c.json({
                data: template
            }, 200)
        } catch (e) {
            console.log(e)
            return c.json(e, 500)
        }
    })

sites.delete(
    "/:siteId/templates/:templateId",
    async (c) => {
        const { templateId } = c.get("template") as Template
        try {
            const { data: template } = await templateEntity.delete({ templateId }).go()
            return c.json({
                data: template
            }, 200)
        } catch (e) {
            console.log(e)
            return c.json(e, 500)
        }
    })


export default sites