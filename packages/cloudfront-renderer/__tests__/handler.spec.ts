import { describe, test, expect, beforeAll, mock } from "bun:test"
import type { CloudFrontRequestEvent, CloudFrontResponse } from 'aws-lambda';
import handler from "../handler"
import { entity as userEntity, type User } from "../../dashboard/server/entities/user";
import { entity as siteEntity, type Site } from "../../dashboard/server/entities/site";
import { entity as templateEntity, type Template } from "../../dashboard/server/entities/template";
import ApiRequestFactory from "../../dashboard/server/factories/ApiRequest";
import createUserFactory from "../../dashboard/server/factories/User";
import defaultTemplateContent from "../../dashboard/utils/defaultTemplateContent";

// from https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-event-structure.html#lambda-event-structure-response
const dummyEventObject = {
    "Records": [
        {
            "cf": {
                "config": {
                    "distributionDomainName": "d111111abcdef8.cloudfront.net",
                    "distributionId": "EDFDVBD6EXAMPLE",
                    "eventType": "origin-response",
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
                                "value": "2.0 8f22423015641505b8c857a37450d6c0.cloudfront.net (CloudFront)"
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
                },
                "response": {
                    "headers": {
                        "access-control-allow-credentials": [
                            {
                                "key": "Access-Control-Allow-Credentials",
                                "value": "true"
                            }
                        ],
                        "access-control-allow-origin": [
                            {
                                "key": "Access-Control-Allow-Origin",
                                "value": "*"
                            }
                        ],
                        "date": [
                            {
                                "key": "Date",
                                "value": "Mon, 13 Jan 2020 20:12:38 GMT"
                            }
                        ],
                        "referrer-policy": [
                            {
                                "key": "Referrer-Policy",
                                "value": "no-referrer-when-downgrade"
                            }
                        ],
                        "server": [
                            {
                                "key": "Server",
                                "value": "ExampleCustomOriginServer"
                            }
                        ],
                        "x-content-type-options": [
                            {
                                "key": "X-Content-Type-Options",
                                "value": "nosniff"
                            }
                        ],
                        "x-frame-options": [
                            {
                                "key": "X-Frame-Options",
                                "value": "DENY"
                            }
                        ],
                        "x-xss-protection": [
                            {
                                "key": "X-XSS-Protection",
                                "value": "1; mode=block"
                            }
                        ],
                        "content-type": [
                            {
                                "key": "Content-Type",
                                "value": "text/html; charset=utf-8"
                            }
                        ],
                        "content-length": [
                            {
                                "key": "Content-Length",
                                "value": "9593"
                            }
                        ]
                    },
                    "status": "200",
                    "statusDescription": "OK"
                }
            }
        }
    ]
}

function createEvent(host: string, path: string) {
    const clonedEvent = structuredClone(dummyEventObject)
    clonedEvent.Records[0].cf.request.headers["host"][0].value = `https://${host}`
    clonedEvent.Records[0].cf.request.uri = path

    return clonedEvent as CloudFrontRequestEvent
}

describe("cloudfront renderer function", () => {

    // setup the site and templates

    let site: Site
    let template: Template
    const domain = `${crypto.randomUUID()}.com`

    beforeAll(async () => {
        const { session } = await createUserFactory()
        const res = await new ApiRequestFactory('/api/sites', {
            name: 'Testing site',
            domain
        }).post.setAuthSession(session.id).go()

        site = await res.json()

        const { data: templateRecord } = await templateEntity.find({ siteId: site.siteId }).go()

        template = templateRecord as Template
    })

    test("renders a page", async () => {
        const callbackSpy = mock()

        await handler(createEvent(domain, '/testing123'), null, callbackSpy)

        expect(callbackSpy).toHaveBeenCalledWith(null, {
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