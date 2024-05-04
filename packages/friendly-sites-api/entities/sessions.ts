import { Entity, createSchema, type EntityItem } from "electrodb";
import { table, client } from "../db";

const schema = createSchema({
    model: {
        entity: 'entity',
        version: '1',
        service: 'teams',
    },
    attributes: {
        sessionId: {
            type: "string",
            default: () => crypto.randomUUID(),
            readOnly: true
        },
        userId: {
            type: "string",
            required: true,
            readOnly: true
        },
        expires_at: {
            type: "number",
            required: true,
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
        session: {
            pk: {
                field: "pk",
                composite: ["sessionId"],
            },
            sk: {
                field: "sk",
                composite: []
            }
        },
        user_sessions: {
            index: "gsi1",
            pk: {
                field: "userId",
                composite: ["userId"],
            }
        }
    }
})

export type Session = EntityItem<typeof entity>

export const entity = new Entity(schema, { table, client })