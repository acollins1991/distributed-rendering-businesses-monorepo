import { Hono } from 'hono'
import { z } from 'zod'
import { type Site } from '../entities/site'
import type { User } from 'lucia'
import { entity as templateEntity, type Template } from "../entities/template"
import { zValidator } from '@hono/zod-validator'
import { createMiddleware } from 'hono/factory'

const templates = new Hono<{
    Variables: {
        site: Site,
        template: Template,
        user: User,
    }
}>()


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
templates.use("/:templateId/*", injectExistingTemplate)

// list
templates.get(
    "/",
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

templates.get(
    "/:templateId",
    async (c) => {
        try {
            const template = c.get("template") as Template
            return c.json(template, 200)
        } catch (e: any) {
            return c.json(e, 500)
        }
    })

templates.post(
    "/",
    zValidator("json", z.object({
        name: z.string(),
        path: z.string().refine((val) => {
            if (val === '/') {
                return true
            }
            const urlPathRegex = /^\/?([a-zA-Z0-9\-._~:\/@*]*)*\/?$/;
            return urlPathRegex.test(val);
        }, {
            message: "Path must be a valid URL path string value",
        })
    })),
    async (c) => {
        const site = c.get("site")
        const { name, path } = c.req.valid("json")

        // check if template with this path already exists
        const { data: [existingTemplate] } = await templateEntity.query.bySiteId({ siteId: site.siteId }).where(({ path: p }, { eq }) => eq(p, path)).go()
        if (existingTemplate) {
            return c.json({ message: `Template with path ${path} already exists` }, 400)
        }

        try {
            const { data: template } = await templateEntity.create({
                name,
                siteId: site.siteId,
                path
            }).go()

            return c.json(template, 200)
        } catch (e: any) {
            return c.json(e, 500)
        }
    })

templates.patch(
    "/:templateId",
    zValidator("json", z.object({
        name: z.string().optional()
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

templates.delete(
    "/:templateId",
    async (c) => {
        const { templateId } = c.get("template") as Template
        try {
            const { data: template } = await templateEntity.delete({ templateId }).go()
            return c.json(template, 200)
        } catch (e: any) {
            return c.json(e, 500)
        }
    })

export default templates