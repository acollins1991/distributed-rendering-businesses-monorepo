import { Entity, createSchema, CustomAttributeType, type EntityItem } from "electrodb";
import { client, table } from "../db/index"
import defaultTemplateContent from "../../utils/defaultTemplateContent";
import isHtml from "is-html"
import type { Editor, ProjectData } from "grapesjs";
import type { z } from "zod";
import entityLogger from "../utils/entityLogger";

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
        path: {
            type: 'string',
            required: true
        },
        // content: {
        //     type: 'string',
        //     default: () => defaultTemplateContent,
        //     validate: (value) => !isHtml(value)
        // },
        content: {
            type: CustomAttributeType<ProjectData>("any")
        },
        variables: {
            type: 'any',
            default: () => ({
                page_title: 'Page Title',
                page_content: 'Page Content'
            }),
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

export const entity = new Entity(schema, { table, client, logger: entityLogger },)

export type Template = EntityItem<typeof entity>