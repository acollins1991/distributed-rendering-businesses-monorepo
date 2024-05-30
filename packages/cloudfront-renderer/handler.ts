import type { CloudFrontResponseHandler } from 'aws-lambda';
import { entity as siteEntity, type Site } from '../dashboard/server/entities/site';
import { entity as templateEntity, type Template } from '../dashboard/server/entities/template';
import Handlebars from 'handlebars';

async function getSiteRecordFromUrl(url: URL): Promise<Site> {
    // TODO: must find another way of doing this
    const { data: [site] } = await siteEntity.scan.where(({ domain }, { eq }) => eq(domain, url.hostname)).go()
    return site
}

async function compileTemplateFromTemplateRecord(templateId: Template["templateId"]): Promise<string> {
    const { data: template } = await templateEntity.get({ templateId }).go()
    const handlebarsTemplate = Handlebars.compile(template?.content || '')
    const compiledTemplate = handlebarsTemplate(template?.variables || {})
    return compiledTemplate
}

export const handler: CloudFrontResponseHandler = async (event) => {

    const request = event.Records[0].cf.request

    const origin = request.headers["host"][0].value
    const pathname = request.uri

    const url = new URL(`${origin}${pathname}`)

    // get relevant site record
    const site = await getSiteRecordFromUrl(url)

    // TODO: just use default template for now
    const pageString = await compileTemplateFromTemplateRecord(site.default_template)

    return {
        status: '200',
        statusDescription: 'OK',
        headers: {
            'cache-control': [{
                key: 'Cache-Control',
                value: 'max-age=100'
            }],
            'content-type': [{
                key: 'Content-Type',
                value: 'text/html'
            }]
        },
        body: pageString,
    }
};

export default handler
