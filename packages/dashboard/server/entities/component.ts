import { Entity, createSchema, CustomAttributeType, type EntityItem } from "electrodb";
import { client, table } from "../db/index"
import isHtml from "is-html"
import entityLogger from "../utils/entityLogger";
import type { Site } from "./site";

type Variable = {
    label: string,
    key: string,
    value: string | number
}

const schema = createSchema({
    model: {
        entity: 'component',
        version: '1',
        service: 'sites',
    },
    attributes: {
        componentId: {
            type: "string",
            default: () => crypto.randomUUID(),
            readOnly: true
        },
        siteId: {
            type: CustomAttributeType<Site["siteId"]>("string"),
            required: true,
            readOnly: true
        },
        name: {
            type: 'string',
            required: true
        },
        content: {
            type: 'string',
            validate: (value) => {
                if(!isHtml(value)) {
                    return 'Component content is not valid HTML'
                }
            }
        },
        variables: {
            type: 'list',
            items: {
                type: CustomAttributeType<Variable>("any"),
            },
            default: () => (
                [
                    {
                        label: 'Component Title',
                        key: 'component_title',
                        value: 'Component Title'
                    },
                    {
                        label: 'Component Content',
                        key: 'component_content',
                        value: 'Component Content'
                    }
                ]),
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
        component: {
            pk: {
                field: "pk",
                composite: ["componentId"],
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

export const entity = new Entity(schema, { table, client, logger: entityLogger })

export type Component = EntityItem<typeof entity>

export async function createComponent(siteId: Site["siteId"], { name, content }: Pick<Component, 'name' | 'content'>) {
    return entity.create({ siteId, name, content }).go()
}

export async function getComponent(componentId: Component["componentId"]) {
    return entity.get({ componentId }).go()
}

export async function getComponents(componentIds: Component["componentId"][]) {
    return entity.get(componentIds.map(componentId => ({ componentId }))).go()
}

export async function deleteComponent(componentId: Component["componentId"]) {
    return entity.delete({ componentId }).go()
}

export async function updateComponent(componentId: Component["componentId"], updateDetails: Partial<Pick<Component, "name" | "content" | "variables">>) {
    return entity.patch({ componentId }).set(updateDetails).go({ response: "all_new" })
}