import { Entity, createSchema, type EntityItem } from "electrodb";
import { table, client } from "../db";
import { generateIdFromEntropySize } from "lucia";
import { add } from "date-fns";

const schema = createSchema({
    model: {
        entity: 'resettoken',
        version: '1',
        service: 'resettokens',
    },
    attributes: {
        tokenId: {
            type: "string",
            // set id using generateIdFromEntropySize to improve security
            default: () => generateIdFromEntropySize(50),
            readOnly: true
        },
        userEmail: {
            type: "string",
            required: true,
            readOnly: true
        },
        expires_at: {
            type: "number",
            readOnly: true,
            default: () => add(Date.now(), { days: 1 }).getTime(),
            set: () => add(Date.now(), { days: 1 }).getTime()
        },
        created_at: {
            type: "number",
            readOnly: true,
            required: true,
            default: () => Date.now(),
            set: () => Date.now(),
        },
    },
    indexes: {
        tokenId: {
            pk: {
                field: "pk",
                composite: ["tokenId"],
            },
            sk: {
                field: "sk",
                composite: []
            }
        }
    }
})

export type ResetToken = EntityItem<typeof entity>

export const tokenEntity = new Entity(schema, { table, client })