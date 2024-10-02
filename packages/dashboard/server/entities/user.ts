import { Entity, createSchema, type EntityItem } from "electrodb";
import entityLogger from "../utils/entityLogger"
import { table, client } from "../db";

function isValidEmail(email: string): boolean {
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(email);
}


const schema = createSchema({
    model: {
        entity: 'user',
        version: '1',
        service: 'teams',
    },
    attributes: {
        userId: {
            type: "string",
            default: () => crypto.randomUUID(),
            readOnly: true
        },
        first_name: {
            type: 'string',
            required: true
        },
        last_name: {
            type: 'string',
            required: true
        },
        email: {
            type: 'string',
            required: true,
            validate: (val) => {
                if (!isValidEmail(val)) {
                    return 'Invalid email'
                }
            }
        },
        sites: {
            type: 'list',
            default: () => [],
            items: {
                type: 'string',
                required: true,
            }
        },
        password_hash: {
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
        users: {
            pk: {
                field: "pk",
                composite: ["userId"],
            },
            sk: {
                field: "sk",
                composite: [],
            },
        },
        email: {
            index: "gsi1pk-gsi1sk-index",
            pk: {
                field: "gsi1pk",
                composite: ["email"]
            },
            sk: {
                field: "gsi1sk",
                composite: []
            }
        }
    }
})

export const entity = new Entity(
    schema,
    { table, client, logger: entityLogger }
)

export type User = EntityItem<typeof entity>