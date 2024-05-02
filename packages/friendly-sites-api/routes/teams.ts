import { Hono } from 'hono'
import type { LambdaBindings } from '../types'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { getAuthUserFromRequestEvent } from '../utils/getAuthUserFromRequestEvent'
import { entity } from '../entities/team'

const teams = new Hono<{ Bindings: LambdaBindings }>()

// /teams POST
const PostBodySchema = z.object({
    name: z.string(),
    users: z.array(z.string()).optional()
})
const PostSchema = z.object({
    env: z.object({
        context: z.unknown(), // Keep as unknown
        event: z.object({
            body: z.string().transform(bodyString => JSON.parse(bodyString) as PostBodySchemaType), // Parse body as JSON and type it
        }),
    }),
})
type PostBodySchemaType = z.infer<typeof PostBodySchema>;
teams.post(
    "/",
    // zValidator('json', PostSchema),
    async (c) => {

        const user = getAuthUserFromRequestEvent(c.env.event)

        if (typeof user !== 'string') {
            return c.json({
                message: 'Not authorised'
            }, 403)
        }

        const { name, users } = JSON.parse(c.env.event.body as string) as PostBodySchemaType

        const team = await entity.create({
            name,
            users: users ?? [user]

        }).go()

        return c.json(team.data, 200)
    })

// /teams PATCH
const PatchBodySchema = z.object({
    name: z.string(),
    users: z.array(z.string()).min(1)
}).partial()
const PatchSchema = z.object({
    env: z.object({
        context: z.unknown(), // Keep as unknown
        event: z.object({
            body: z.string().transform(bodyString => JSON.parse(bodyString) as PatchBodySchemaType), // Parse body as JSON and type it
        }),
    }),
})
type PatchBodySchemaType = z.infer<typeof PatchBodySchema>;
teams.patch(
    "/:teamId",
    // zValidator('json', PostSchema),
    async (c) => {

        const user = getAuthUserFromRequestEvent(c.env.event)

        if (typeof user !== 'string') {
            return c.json({
                message: 'Not authorised'
            }, 403)
        }

        const teamId = c.req.param("teamId")
        const patchObject = JSON.parse(c.env.event.body as string) as PostBodySchemaType
        const team = await entity.patch({ teamId }).set(patchObject).go({ response: "all_new" })

        return c.json(team.data, 200)
    })

// /teams PATCH
teams.get(
    "/:teamId",
    // zValidator('json', PostSchema),
    async (c) => {

        const user = getAuthUserFromRequestEvent(c.env.event)

        if (typeof user !== 'string') {
            return c.json({
                message: 'Not authorised'
            }, 403)
        }

        const teamId = c.req.param("teamId")
        const team = await entity.get({ teamId }).go()

        return c.json(team.data, 200)
    })

// /teams DELETE
teams.delete(
    "/:teamId",
    // zValidator('json', PostSchema),
    async (c) => {

        const user = getAuthUserFromRequestEvent(c.env.event)

        if (typeof user !== 'string') {
            return c.json({
                message: 'Not authorised'
            }, 403)
        }

        const teamId = c.req.param("teamId")
        const team = await entity.delete({ teamId }).go({ response: "all_old" })

        return c.json(team.data, 200)
    })

export default teams