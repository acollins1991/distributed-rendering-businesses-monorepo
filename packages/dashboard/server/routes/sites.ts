import { Hono } from 'hono'
import { z } from 'zod'
import { friendlySitesDomainGenerator } from '../utils/friendlySitesDomainGenerator'
import { addFriendlySitesDNSRecord, createHostedZone, deleteHostedZone } from '../utils/manageHostedZone'
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

            const domain = friendlySitesDomainGenerator()

            /**
             * TODO: Should be a better way of doing this, currently using 3 db calls
             * We are creating the site record with an empty string as the default_template value as a palceholder,
             * then we create a template, 
             * then we patch the site record with the new template id
             * 
             * Potentially we can generate the site ID manually so that we only make two db calls (possibly a transact write)
             */

            const { data: { siteId } } = await entity.create({
                name,
                domain,
                // placeholder value
                default_template: ''
            }).go()

            const { data: template } = await templateEntity.create({ siteId, name: "Default" }).go()

            // add template
            const { data: site } = await entity.patch({ siteId }).set({
                default_template: template.templateId
            }).go({ response: "all_new" })

            // add new site id to the user record as ownership signal
            const user = c.get("user")
            await userEntity.patch({ userId: user.userId }).append({ sites: [site.siteId] }).go()

            // add new record to default hosted zone
            await addFriendlySitesDNSRecord(domain)

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
    } catch (e: any) {
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
        } catch (e: any) {
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
        } catch (e: any) {
            return c.json(e, 500)
        }
    })

sites.get(
    "/:siteId/templates/:templateId",
    async (c) => {
        try {
            const template = c.get("template") as Template
            return c.json(template, 200)
        } catch (e: any) {
            return c.json(e, 500)
        }
    })

sites.patch(
    "/:siteId/templates/:templateId",
    zValidator("json", z.object({
        name: z.string().optional(),
        variables: z.record(z.string(), z.string())
    })),
    async (c) => {
        const { templateId } = c.get("template") as Template
        const patchObject = c.req.valid("json")
        try {
            const { data: template } = await templateEntity.patch({ templateId }).set(patchObject).go({ response: "all_new" })
            return c.json(template, 200)
        } catch (e: any) {
            return c.json(e, 500)
        }
    })

sites.delete(
    "/:siteId/templates/:templateId",
    async (c) => {
        const { templateId } = c.get("template") as Template
        try {
            const { data: template } = await templateEntity.delete({ templateId }).go()
            return c.json(template, 200)
        } catch (e: any) {
            return c.json(e, 500)
        }
    })


export default sites