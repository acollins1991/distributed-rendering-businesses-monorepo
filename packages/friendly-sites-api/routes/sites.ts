import { Hono } from 'hono'
import type { Context, Next } from "hono"
import type { LambdaBindings } from '../types'
import { ZodSchema, z } from 'zod'
import { getAuthUserFromRequestEvent } from '../utils/getAuthUserFromRequestEvent'
import { friendlySitesDomainGenerator } from '../utils/friendlySitesDomainGenerator'
import { createHostedZone, deleteHostedZone } from '../utils/manageHostedZone'
import { entity } from '../entities/site'
import validateLambdaEvent from '../utils/validateLambdaEvent'

const sites = new Hono<{ Bindings: LambdaBindings }>()

// /sites POST
const BodySchema = z.object({
    teamId: z.string(),
    name: z.string(),
    domain: z.string().optional()
})
type BodySchemaType = z.infer<typeof BodySchema>;
sites.post(
    "/",
    validateLambdaEvent({
        bodySchema: BodySchema
    }),
    async (c) => {

        const user = getAuthUserFromRequestEvent(c.env.event)

        if (typeof user !== 'string') {
            return c.json({
                message: 'Not authorised'
            }, 403)
        }

        const { teamId, name, domain: reqDomain } = JSON.parse(c.env.event.body as string) as BodySchemaType

        const domain = reqDomain ? reqDomain : friendlySitesDomainGenerator()
        const hostedZone = await createHostedZone(domain)

        const team = await entity.create({
            teamId,
            name,
            domain,
            hosted_zone: hostedZone.HostedZone?.Id as string

        }).go()

        return c.json(team.data, 200)
    })

// /sites PATCH
const PatchBodySchema = z.object({
    name: z.string(),
    domain: z.string()
}).partial()
type PatchBodySchemaType = z.infer<typeof PatchBodySchema>;
sites.patch(
    "/:siteId",
    validateLambdaEvent({
        bodySchema: PatchBodySchema
    }),
    async (c) => {

        const user = getAuthUserFromRequestEvent(c.env.event)

        if (typeof user !== 'string') {
            return c.json({
                message: 'Not authorised'
            }, 403)
        }

        const patchObject = JSON.parse(c.env.event.body as string) as PatchBodySchemaType

        const siteId = c.req.param('siteId')


        const { data: existingRecord } = await entity.get({ siteId }).go()

        if (!existingRecord) {
            return c.json({
                message: `Site ${siteId} record not found`
            }, 403)
        }

        const updatedRecordCommand = entity.patch({ siteId })
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
    async (c) => {

        const user = getAuthUserFromRequestEvent(c.env.event)

        if (typeof user !== 'string') {
            return c.json({
                message: 'Not authorised'
            }, 403)
        }

        const siteId = c.req.param('siteId')
        const team = await entity.delete({ siteId }).go()

        return c.json(team, 200)
    })

// /sites DELETE
sites.get(
    "/:siteId",
    async (c) => {

        const user = getAuthUserFromRequestEvent(c.env.event)

        if (typeof user !== 'string') {
            return c.json({
                message: 'Not authorised'
            }, 403)
        }

        const siteId = c.req.param('siteId')
        const team = await entity.get({ siteId }).go()

        return c.json(team, 200)
    })


export default sites