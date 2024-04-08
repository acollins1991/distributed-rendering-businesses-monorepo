import { Entity, type Schema } from "electrodb";
import { client, table } from "../db/index"

const version = "1"

type EntitySchema = Schema<string, string, string>

function createNewEntity<T>(
    entity: EntitySchema["model"]["entity"],
    service: EntitySchema["model"]["service"],
    attributes: Omit<EntitySchema["attributes"], 'id' | 'created_at' | 'updated_at'>,
    indexes: EntitySchema["indexes"]
) {

    return new Entity({
        model: {
            entity: entity,
            version: version,
            service: service,
        },
        attributes: {
            ...attributes,
            id: {
                type: "string",
                default: () => crypto.randomUUID(),
                readOnly: true
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
                set: () => Date.now(),
            },
        },
        indexes
    }, { table, client },)
}

export default createNewEntity