import { Entity, createSchema } from "electrodb";
import createNewEntity from "./createNewEntity";
import { client, table } from "../db/index"

const schema = createSchema({
    model: {
        entity: 'entity',
        version: '1',
        service: 'sites',
    },
    attributes: {
        siteId: {
            type: "string",
            default: () => crypto.randomUUID(),
            readOnly: true
        },
        teamId: {
            type: 'string',
            required: true,
            readOnly: true
        },
        name: {
            type: 'string',
            required: true
        },
        domain: {
            type: 'string',
            required: true
        },
        hosted_zone: {
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