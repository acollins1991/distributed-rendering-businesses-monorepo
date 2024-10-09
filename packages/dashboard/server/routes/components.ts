import { Hono } from 'hono'
import { z, ZodType } from 'zod'
import { type Site } from '../entities/site'
import type { User } from 'lucia'
import { createMiddleware } from 'hono/factory'
import { type Template } from "../entities/template"
import { zValidator } from '@hono/zod-validator'
import { entity as componentEntity, createComponent, deleteComponent, getComponents, updateComponent, type Component } from '../entities/component'

const components = new Hono<{
    Variables: {
        site: Site,
        template: Template,
        user: User,
        component: Component
    }
}>()

// components
const componentPostValidation: ZodType<Parameters<typeof createComponent>[1]> = z.object({
    name: z.string(),
    content: z.string()
})
components.post(
    "/",
    zValidator("json", componentPostValidation),
    async (c) => {
        const site = c.get("site")
        const { name, content } = c.req.valid("json")

        // check if if component with name already exists
        const { data: [existingComponent] } = await componentEntity.query.bySiteId({ siteId: site.siteId }).go()
        if (existingComponent) {
            return c.json({ message: `Component with name ${name} already exists` }, 400)
        }

        try {
            const { data: component } = await createComponent(site.siteId, { name, content })

            return c.json(component, 200)
        } catch (e: any) {
            return c.json(e, 500)
        }
    })

components.get(
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
            const { data: components, cursor } = await componentEntity.query.bySiteId({ siteId: site.siteId }).go(executionArgs)

            return c.json({
                data: components,
                cursor: cursor,
                links: {
                    nextPage: `${c.req.path}?cursor=${cursor}`
                }
            }, 200)
        } catch (e: any) {
            return c.json(e, 500)
        }
    })

components.get(
    "/specific",
    zValidator("query", z.object({
        ids: z.array(z.string())
    })),
    async (c) => {
        const { ids } = c.req.valid("query")

        try {
            const { data: components } = await getComponents(ids)

            return c.json(components, 200)
        } catch (e: any) {
            return c.json(e, 500)
        }
    })

const setComponentRecordMiddleware = createMiddleware(async (c, next) => {
    const { siteId } = c.get("site")
    const componentId = c.req.param('componentId') as string
    const { data: [component] } = await componentEntity.query.bySiteId({ siteId }).where(({ componentId: id }, { eq }) => eq(id, componentId)).go()

    if (!component) {
        return c.json({
            message: "Cannot find component"
        }, 404)
    }

    c.set("component", component)

    await next()
})

components.use("/:componentId", setComponentRecordMiddleware)

components.get(
    "/:componentId",
    async (c) => {
        try {
            const component = c.get("component")
            return c.json(component, 200)
        } catch (e: any) {
            return c.json(e, 500)
        }
    }
)

components.delete(
    "/:componentId",
    async (c) => {
        try {
            const component = c.get("component")
            const { data } = await deleteComponent(component.componentId)
            return c.json(data, 200)
        } catch (e: any) {
            return c.json(e, 500)
        }
    }
)

const componentPatchSchema: ZodType<Parameters<typeof updateComponent>[1]> = z.object({
    name: z.string(),
    content: z.string()
}).partial()
components.patch(
    "/:componentId",
    zValidator("json", componentPatchSchema),
    async (c) => {
        try {
            const { componentId } = c.get("component")
            const updateDetails = c.req.valid("json")
            const { data } = await updateComponent(componentId, updateDetails)
            return c.json(data, 200)
        } catch (e: any) {
            return c.json(e, 500)
        }
    }
)


export default components