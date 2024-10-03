import type { CloudFrontResponseHandler } from 'aws-lambda';
import { entity as siteEntity, type Site } from '../dashboard/server/entities/site';
import { entity as templateEntity, type Template } from '../dashboard/server/entities/template';
import Handlebars from 'handlebars';

async function getSiteRecordFromUrl(url: URL): Promise<Site> {
    // TODO: must find another way of doing this
    const { data: [site] } = await siteEntity.scan.where(({ domain }, { eq }) => eq(domain, url.hostname)).go()
    return site
}

async function compileTemplateFromTemplateRecord(template: Template) {
    const handlebarsTemplate = Handlebars.compile(template.content || '')
    const variables = template.variables?.reduce((accumulator: Record<string, any>, current) => {
        accumulator[current.key] = current.value
        return accumulator
    }, {})
    const compiledTemplate = handlebarsTemplate(variables || {})
    return compiledTemplate
}

async function getTemplateFromUrlPath(siteId: Site["siteId"], pathname: URL["pathname"]) {

    // cannot currently filter inside query for regex check
    const { data: templates } = await templateEntity.query.bySiteId({ siteId }).go()
    const template = templates.find(t => {
        const pathRegex = new RegExp(`^${t.path.replaceAll("*", '.*')}$`);
        return Boolean(pathRegex.test(pathname))
    })

    return template
}

export const handler: CloudFrontResponseHandler = async (event) => {

    const request = event.Records[0].cf.request

    const origin = request.headers["host"][0].value
    const pathname = request.uri
    const fullUrl = `https://${origin}${pathname}`

    const url = new URL(fullUrl.endsWith('/') ? fullUrl.slice(0, -1) : fullUrl)

    // get relevant site record
    const site = await getSiteRecordFromUrl(url)
    const targetTemplate = await getTemplateFromUrlPath(site.siteId, url.pathname)

    if( !targetTemplate ) {
        return {
            status: '404',
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
            body: "Page not found",
        } 
    }

    // TODO: just use default template for now
    const pageString = await compileTemplateFromTemplateRecord(targetTemplate)

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
