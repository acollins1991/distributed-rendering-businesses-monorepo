import type { CloudFrontResponseHandler } from 'aws-lambda';
import { entity as siteEntity, type Site } from '../dashboard/server/entities/site';
import grapesjs, { Page, Pages, type Editor, type ProjectData } from 'grapesjs';
import minifyHtml from "@minify-html/node";
import { match } from "path-to-regexp"

async function getSiteRecordFromUrl(url: URL): Promise<Site> {
    // TODO: must find another way of doing this
    const { data: [site] } = await siteEntity.scan.where(({ domain }, { eq }) => eq(domain, url.hostname)).go()
    return site
}

function getPageFromUrlPath(pages: (Page & { attributes: { path: string } })[], pathname: URL["pathname"]) {
    const page = pages.find((p) => {
        const routeMatcher = match(p.attributes.path)
        const isMatch = routeMatcher(pathname)
        return isMatch
    })

    return page
}

async function compilePage(site: Site, pathname: URL["pathname"]) {
    if (!site.grapejs_project_data) {
        throw new Error(`There was an issue getting the page data for site ${site.siteId}`)
    }
    const editor = grapesjs.init({ headless: true })
    editor.loadProjectData(site.grapejs_project_data.data)
    const pages = editor.Pages
    const targetPage = getPageFromUrlPath(pages.getAll(), pathname) as Page
    
    if( !targetPage ) {
        throw new Error(`Unable to find page with path matching ${pathname}`)
    }

    pages.select(targetPage)

    return {
        html: editor.getHtml(),
        css: editor.getCss(),
        js: editor.getJs()
    }
}

export const handler: CloudFrontResponseHandler = async (event) => {

    const request = event.Records[0].cf.request

    const origin = request.headers["host"][0].value
    const pathname = request.uri
    const fullUrl = `https://${origin}${pathname}`

    const url = new URL(fullUrl.endsWith('/') ? fullUrl.slice(0, -1) : fullUrl)

    // get relevant site record
    const site = await getSiteRecordFromUrl(url)

    if (!site) {
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
    const { html, css, js } = await compilePage(site, url.pathname)

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
        body: minifyHtml.minify(Buffer.from(`
            <!DOCTYPE html>
            <html>
                <head>
                    ${css ?? `<style>${css}</style>`}
                    ${js ?? `<script defer>${js}</script>`}
                </head>
                ${html}
            </html>
        `), { do_not_minify_doctype: true, keep_closing_tags: true }).toString(),
    }
};

export default handler
