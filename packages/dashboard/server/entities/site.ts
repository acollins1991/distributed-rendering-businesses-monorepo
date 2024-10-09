import { CustomAttributeType, Entity, createSchema, type EntityItem } from "electrodb";
import { client, table } from "../db/index"
import entityLogger from "../utils/entityLogger";
import grapesjs, { type Editor, type ProjectData } from 'grapesjs';

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
        // custom domains not yet supported
        custom_domain: {
            type: 'boolean',
            set: () => false
        },
        domain: {
            type: 'string',
            required: true,
        },
        grapejs_project_data: {
            type: CustomAttributeType<ProjectData>("any")
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

export const entity = new Entity(schema, { table, client, logger: entityLogger },)

export type Site = EntityItem<typeof entity>

export async function updateGrapeJsProjectData(siteId: Site["siteId"], grapejs_project_data: ProjectData) {
    return entity.patch({ siteId }).set({ grapejs_project_data }).go({ response: "updated_new" })
}