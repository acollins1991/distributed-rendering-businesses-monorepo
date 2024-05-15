import { Hono } from 'hono'
import type { Context } from "hono"
import type { ApiContext } from '../types'
import { z } from 'zod'
import { friendlySitesDomainGenerator } from '../utils/friendlySitesDomainGenerator'
import { createHostedZone, deleteHostedZone } from '../utils/manageHostedZone'
import { entity, type Site } from '../entities/site'
import validateLambdaEvent from '../utils/validateLambdaEvent'
import apiValidateBearerTokenMiddleware from '../utils/apiValidateBearerTokenMiddleware'
import type { User } from 'lucia'
import { createMiddleware } from 'hono/factory'
import { entity as userEntity } from "../entities/user"

function protectSiteRecordMiddleware(failedMessage: string) {
    return createMiddleware(async (c: Context<ApiContext>, next) => {

        const user = c.get("user") as User
        const siteId = c.req.param('siteId') as string

        if (!user || !user.sites?.includes(siteId)) {
            return c.json({
                message: failedMessage
            }, 403)
        }

        await next()
    })
}

const setSiteRecordMiddleware = createMiddleware(async (c: Context<ApiContext>, next) => {
    const siteId = c.req.param('siteId') as string
    const { data: site } = await entity.get({ siteId }).go()

    if (!site) {
        return c.json({
            message: "Cannot find site record"
        })
    }

    c.set("site", site)

    await next()
})

const sites = new Hono<ApiContext>()

// protect these routes
sites.use("*", apiValidateBearerTokenMiddleware)

// /sites POST
const BodySchema = z.object({
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
        const { name, domain: reqDomain } = JSON.parse(c.env.event.body as string) as BodySchemaType

        const domain = reqDomain ? reqDomain : friendlySitesDomainGenerator()
        const hostedZone = await createHostedZone(domain)

        try {
            const site = await entity.create({
                name,
                domain,
                hosted_zone: hostedZone.HostedZone?.Id as string
            }).go()

            // add new site id to the user record as ownership signal
            const user = c.get("user") as User
            await userEntity.patch({ userId: user.userId }).append({ sites: [site.data.siteId] }).go()

            return c.json(site.data, 200)
        } catch (e) {
            return c.json(e, 500)
        }
    })

// /sites PATCH
const PatchBodySchema = z.object({
    name: z.string().optional(),
    domain: z.string().optional()
}).partial()
type PatchBodySchemaType = z.infer<typeof PatchBodySchema>;
sites.patch(
    "/:siteId",
    validateLambdaEvent({
        bodySchema: PatchBodySchema
    }),
    protectSiteRecordMiddleware('User cannot edit site record'),
    setSiteRecordMiddleware,
    async (c) => {

        const patchObject = JSON.parse(c.env.event.body as string) as PatchBodySchemaType
        const existingRecord = c.get("site") as Site

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
    setSiteRecordMiddleware,
    async (c) => {
        const site = c.get("site") as Site

        return c.json(site, 200)
    })


export default sites