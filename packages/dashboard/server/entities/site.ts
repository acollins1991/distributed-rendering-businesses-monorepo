import { Entity, createSchema, CustomAttributeType, type EntityItem } from "electrodb";
import { client, table } from "../db/index"
import { z } from "zod";

const domainType = z.union([
    z.object({
        type: z.literal("custom"),
        hosted_zone: z.string(),
        value: z.string(),
    }),
    z.object({
        type: z.literal("subdomain"),
        value: z.string(),
    }),
]);

export type Domain = z.infer<typeof domainType>;

const schema = createSchema({
    model: {
        entity: 'site',
        version: '1',
        service: 'sites',
    },
    attributes: {
        siteId: {
            type: "string",
            default: () => crypto.randomUUID(),
            readOnly: true
        },
        name: {
            type: 'string',
            required: true
        },
        domain: {
            type: CustomAttributeType<Domain>("any"),
            required: true,
            validate: (val: any) => {
                const { success } = domainType.safeParse(val)
                if (!success) {
                    return false
                }
            }
        },
        default_template: {
            type: 'string',
            required: true
        },
        created_at: {
            type: "number",
            readOnly: true,
            required: true,
            default: () => Date.now(),
            set: () => Date.now(),
        },
        updated_at: {
            type: "number",
            watch: "*",
            required: true,
            default: () => Date.now(),
            set: () => Date.now()
        },
    },
    indexes: {
        site: {
            pk: {
                field: "pk",
                composite: ["siteId"],
            },
            sk: {
                field: "sk",
                composite: [],
            },
        }
    }
})

export const entity = new Entity(schema, { table, client },)

export type Site = EntityItem<typeof entity>