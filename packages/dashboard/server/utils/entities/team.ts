import { Entity, createSchema } from "electrodb";
import { client, table } from "../db/index"

const schema = createSchema({
    model: {
        entity: 'team',
        version: '1',
        service: 'teams',
    },
    attributes: {
        teamId: {
            type: "string",
            default: () => crypto.randomUUID(),
            readOnly: true
        },
        name: {
            type: 'string',
            required: true
        },
        users: {
            type: 'list',
            items: {
                type: 'string',
                required: true,
            },
            validate: (value: Array<string>) => value.length > 0 ? '' : 'Teams require at least one user'
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
        team: {
            pk: {
                field: "pk",
                composite: ["teamId"],
            },
            sk: {
                field: "sk",
                composite: [],
            },
        }
    }
})

export const teamEntity = new Entity(schema, { table, client },)