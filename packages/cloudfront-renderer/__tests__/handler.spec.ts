import { describe, test, expect, beforeAll, mock, beforeEach } from "bun:test"
import type { CloudFrontRequestEvent } from 'aws-lambda';
import type { Distribution } from "@aws-sdk/client-cloudfront"
import handler from "../handler"
import { entity, updateGrapeJsProjectData, type Site } from "../../dashboard/server/entities/site";
import ApiRequestFactory from "../../dashboard/server/factories/ApiRequest";
import createUserFactory from "../../dashboard/server/factories/User";
import defaultTemplateContent from "../../dashboard/utils/defaultTemplateContent";
import { mock as mockType } from "vitest-mock-extended"
import grapesjs, { type Editor, type ProjectData } from 'grapesjs';
import createPage from "../../dashboard/server/factories/Page";
import minifyHtml from "@minify-html/node";
import createSite from "../../dashboard/server/factories/Site";

// from https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-event-structure.html#lambda-event-structure-response
const dummyEventObject = {
    "Records": [
        {
            "cf": {
                "config": {
                    "distributionDomainName": "d111111abcdef8.cloudfront.net",
                    "distributionId": "EDFDVBD6EXAMPLE",
                    "eventType": "origin-request",
                    "requestId": "4TyzHTaYWb1GX1qTfsHhEqV6HUDd_BzoBZnwfnvQc_1oF26ClkoUSEQ=="
                },
                "request": {
                    "clientIp": "203.0.113.178",
                    "headers": {
                        "x-forwarded-for": [
                            {
                                "key": "X-Forwarded-For",
                                "value": "203.0.113.178"
                            }
                        ],
                        "user-agent": [
                            {
                                "key": "User-Agent",
                                "value": "Amazon CloudFront"
                            }
                        ],
                        "via": [
                            {
                                "key": "Via",
                                "value": "2.0 2afae0d44e2540f472c0635ab62c232b.cloudfront.net (CloudFront)"
                            }
                        ],
                        "host": [
                            {
                                "key": "Host",
                                "value": "example.org"
                            }
                        ],
                        "cache-control": [
                            {
                                "key": "Cache-Control",
                                "value": "no-cache"
                            }
                        ]
                    },
                    "method": "GET",
                    "origin": {
                        "custom": {
                            "customHeaders": {},
                            "domainName": "example.org",
                            "keepaliveTimeout": 5,
                            "path": "",
                            "port": 443,
                            "protocol": "https",
                            "readTimeout": 30,
                            "sslProtocols": [
                                "TLSv1",
                                "TLSv1.1",
                                "TLSv1.2"
                            ]
                        }
                    },
                    "querystring": "",
                    "uri": "/"
                }
            }
        }
    ]
}

function createEvent(host: string, path: string) {
    const clonedEvent = structuredClone(dummyEventObject)
    clonedEvent.Records[0].cf.request.headers["host"][0].value = host
    clonedEvent.Records[0].cf.request.uri = path

    return clonedEvent as CloudFrontRequestEvent
}

describe("cloudfront renderer function", () => {

    beforeAll(async () => {

        // mock cloudfront distribution retrieval
        mock.module('../../dashboard/server/utils/taggedResources', () => {
            const dummyDistribution: Distribution = Object.assign({}, mockType<Distribution>(), {
                DomainName: 'cloudfrontdistribution.com'
            })
            return {
                async getDefaultCloudfrontDistribution(): Promise<Distribution> {
                    return dummyDistribution
                }
            }
        })
    })

    test("renders a page, based on path /", async () => {

        const site = await createSite()
        const updateData: ProjectData = { "id": site.siteId, "data": { "assets": [], "styles": [], "pages": [createPage()] } }
        await updateGrapeJsProjectData(site.siteId, updateData)
        const res = await handler(createEvent(site.domain, '/'))

        expect(res?.status).toBe("200")
        expect(res?.body).toContain("U am a thing")
    })

    test("renders a page, based on path /about", async () => {

        const site = await createSite()
        const updateData: ProjectData = { "id": site.siteId, "data": { "assets": [], "styles": [], "pages": [createPage(), createPage('/about', 'I am the about page')] } }
        await updateGrapeJsProjectData(site.siteId, updateData)

        const res = await handler(createEvent(site.domain, '/about'))

        expect(res?.status).toBe("200")
        expect(res?.body).toContain("I am the about page")
    })

    // test("renders a page, based on path /product/123 with wildcard path (/product/*)", async () => {

    //     // create /product/* template
    //     await new ApiRequestFactory(`/api/sites/${site.siteId}/templates`, {
    //         name: "Product 123",
    //         path: '/product/*'
    //     }).post.setAuthSession(session.id).go()

    //     const res = await handler(createEvent(site.domain, '/product/123'))

    //     expect(res).toEqual({
    //         status: '200',
    //         statusDescription: 'OK',
    //         headers: {
    //             'cache-control': [{
    //                 key: 'Cache-Control',
    //                 value: 'max-age=100'
    //             }],
    //             'content-type': [{
    //                 key: 'Content-Type',
    //                 value: 'text/html'
    //             }]
    //         },
    //         body: defaultTemplateContent.replace('{{ page_title }}', 'Page Title').replace('{{ page_content }}', 'Page Content'),
    //     })
    // })

    // test("renders a page which indlues a component", async () => {
    //     // create template
    //     const pathname = `/${faker.internet.domainWord()}-${faker.internet.domainWord()}`
    //     const { data: template } = await createTemplate(site.siteId, {
    //         name: `Component ${faker.word.words(4)}`,
    //         path: pathname,
    //     })

    //     // create component
    //     const { data: component } = await createComponent(site.siteId, {
    //         name: `Component ${faker.word.words(4)}`,
    //         content: '<div>I am a component</div>'
    //     })

    //     // update template with new component
    //     await updateTemplate(template.templateId, {
    //         content: `<div>Component: {{> component__${component.componentId} }}</div>`,
    //         registered_components: [component.componentId]
    //     })

    //     const res = await handler(createEvent(site.domain, pathname))

    //     expect(res).toEqual({
    //         status: '200',
    //         statusDescription: 'OK',
    //         headers: {
    //             'cache-control': [{
    //                 key: 'Cache-Control',
    //                 value: 'max-age=100'
    //             }],
    //             'content-type': [{
    //                 key: 'Content-Type',
    //                 value: 'text/html'
    //             }]
    //         },
    //         body: `<div>Component: ${component.content}</div>`,
    //     })
    // })
})