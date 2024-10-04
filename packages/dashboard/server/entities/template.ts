import { Entity, createSchema, CustomAttributeType, type EntityItem } from "electrodb";
import { client, table } from "../db/index"
import defaultTemplateContent from "../../utils/defaultTemplateContent";
import isHtml from "is-html"
import type { Editor, ProjectData } from "grapesjs";
import { string, type z } from "zod";
import entityLogger from "../utils/entityLogger";
import type { Component } from "./component";
import type { Site } from "./site";

type Variable = {
    label: string,
    key: string,
    value: string | number
}

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
        content: {
            type: 'string',
            default: () => defaultTemplateContent,
            validate: (value) => !isHtml(value)
        },
        variables: {
            type: 'list',
            items: {
                type: CustomAttributeType<Variable>("any"),
            },
            default: () => (
                [
                    {
                        label: 'Page Title',
                        key: 'page_title',
                        value: 'Page Title'
                    },
                    {
                        label: 'Page Content',
                        key: 'page_content',
                        value: 'Page Content'
                    }
                ]),
        },
        registered_components: {
            type: 'list',
            items: {
                type: CustomAttributeType<Component["componentId"]>("string"),
            },
            default: () => []
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

export async function getTemplate(templateId: Template["templateId"]) {
    return entity.get({ templateId }).go()
}

export async function createTemplate(siteId: Site["siteId"], { name, path }: Omit<Parameters<typeof entity.create>[0], 'siteId'>) {
    return entity.create({ siteId, name, path }).go()
}

function checkContentForRegisteredVariables(content: NonNullable<Template["content"]>, componentIds: NonNullable<Template["registered_components"]>) {
    const errors: string[] = []
    const regex = new RegExp("\{\{\> component__[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12} \}\}\s*")
    const componentsInContent = content.match(regex)

    if (componentIds.length && !componentsInContent) {
        errors.push("No components detected in the template content")
    } else if (componentsInContent && componentsInContent.length !== componentIds.length) {
        errors.push(`Difference in registered components and those present in template content: ${componentIds.length} registered components, ${componentsInContent.length} detected in content`)
    }

    if (componentsInContent) {
        const componentsInContentToIds = componentsInContent.map((string) => {
            const pattern = /\{\{\> component__([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i;
            const match = string.match(pattern);
            if (match) {
                return match[1];
            } else {
                return null
            }
        }).filter((val) => Boolean(val)).sort()
        const sortedRegisteredComponents = [...componentIds].sort()
        if (JSON.stringify(componentsInContentToIds) !== JSON.stringify(sortedRegisteredComponents)) {
            errors.push("Registered components and components in content do not match")
        }
    }

    return errors
}

export async function updateTemplate(templateId: Template["templateId"], details: Partial<Pick<Template, "name" | "content" | "variables" | "registered_components">>) {

    // if content or registered components changing we need to confirm components are synced in the content and registered content
    if (details.content || details.registered_components) {
        const { data: currentTemplate } = await getTemplate(templateId)
        // update template values with new content or registered components
        const updatedTemplate = {...currentTemplate, ...details}

        const componentErrors = checkContentForRegisteredVariables(updatedTemplate.content || '', updatedTemplate.registered_components  || [])

        // if there are any errors in the components check throw
        if( componentErrors.length ) {
            return componentErrors
        }
    }


    return entity.patch({ templateId }).set(details).go({ response: "all_new" })
}