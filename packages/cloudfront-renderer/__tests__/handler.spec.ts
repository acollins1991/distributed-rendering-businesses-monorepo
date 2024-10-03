import { describe, test, expect, beforeAll, mock } from "bun:test"
import type { CloudFrontRequestEvent } from 'aws-lambda';
import type { Distribution } from "@aws-sdk/client-cloudfront"
import handler from "../handler"
import { type Site } from "../../dashboard/server/entities/site";
import { entity as templateEntity, type Template } from "../../dashboard/server/entities/template";
import ApiRequestFactory from "../../dashboard/server/factories/ApiRequest";
import createUserFactory from "../../dashboard/server/factories/User";
import defaultTemplateContent from "../../dashboard/utils/defaultTemplateContent";
import { mock as mockType } from "vitest-mock-extended"
import type { Session } from "../../dashboard/server/entities/sessions";

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

    // setup the site and templates

    let site: Site
    let template: Template
    let session: Awaited<ReturnType<typeof createUserFactory>>["session"]

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

        const { session: s } = await createUserFactory()
        session = s
        const res = await new ApiRequestFactory('/api/sites', {
            name: 'Testing site'
        }).post.setAuthSession(session.id).go()

        site = await res.json()

        const { data: templateRecord } = await templateEntity.find({ siteId: site.siteId }).go()

        template = templateRecord as Template
    })

    test("renders a page, based on path /", async () => {

        const res = await handler(createEvent(site.domain, '/'))

        expect(res).toEqual({
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
            body: defaultTemplateContent.replace('{{ page_title }}', 'Page Title').replace('{{ page_content }}', 'Page Content'),
        })
    })

    test("renders a page, based on path /about", async () => {

        // create /about template
        await new ApiRequestFactory(`/api/sites/${site.siteId}/templates`, {
            name: "About Page",
            path: '/about'
        }).post.setAuthSession(session.id).go()

        const res = await handler(createEvent(site.domain, '/about'))

        expect(res).toEqual({
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
            body: defaultTemplateContent.replace('{{ page_title }}', 'Page Title').replace('{{ page_content }}', 'Page Content'),
        })
    })

    test("renders a page, based on path /product/123 with wildcard path (/product/*)", async () => {

        // create /product/* template
        await new ApiRequestFactory(`/api/sites/${site.siteId}/templates`, { 
            name: "Product 123",
            path: '/product/*'
        }).post.setAuthSession(session.id).go()

        const res = await handler(createEvent(site.domain, '/product/123'))

        expect(res).toEqual({
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
            body: defaultTemplateContent.replace('{{ page_title }}', 'Page Title').replace('{{ page_content }}', 'Page Content'),
        })
    })
})