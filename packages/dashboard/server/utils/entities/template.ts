import { Entity, createSchema, type EntityItem } from "electrodb";
import { client, table } from "../db/index"

const schema = createSchema({
    model: {
        entity: 'template',
        version: '1',
        service: 'sites',
    },
    attributes: {
        templateId: {
            type: "string",
            default: () => crypto.randomUUID(),
            readOnly: true
        },
        siteId: {
            type: "string",
            required: true,
            readOnly: true
        },
        name: {
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
        template: {
            pk: {
                field: "pk",
                composite: ["templateId"],
            },
            sk: {
                field: "sk",
                composite: [],
            },
        },
        bySiteId: {
            index: "gsi1pk-gsi1sk-index",
            pk: {
                field: "gsi1pk",
                composite: ["siteId"]
            },
            sk: {
                field: "gsi1sk",
                composite: []
            }
        }
    }
})

export const templateEntity = new Entity(schema, { table, client },)

export type Template = EntityItem<typeof entity>