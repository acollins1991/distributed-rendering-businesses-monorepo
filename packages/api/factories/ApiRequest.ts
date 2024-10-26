import { handler } from "../handler";
import { app } from "../honoApp";
import { tokenCookieName } from "../utils/authCookieName";
import createUserFactory from "./User";

type HandlerEvent = Parameters<typeof handler>[0]

function createEvent(endpoint: string, body: Object, method: 'GET' | 'POST' | 'PATCH' | 'DELETE', cookie: string) {

    const url = new URL(endpoint)
    const stringifiedBody = body ? JSON.stringify(body) : undefined

    return {
        "resource": url.pathname,
        "path": url.pathname,
        "httpMethod": method,
        "body": stringifiedBody,
        "rawPath": url.pathname,
        "requestContext": {
            "resourcePath": url.pathname,
            "httpMethod": method,
            "path": "/Prod/",
            "body": stringifiedBody,
            "http": {
                "method": method
            }
        },
        "headers": {
            "Cookie": cookie,
            "Content-Type": "application/json",
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-encoding": "gzip, deflate, br",
            "Host": "70ixmpl4fl.execute-api.us-east-2.amazonaws.com",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
            "X-Amzn-Trace-Id": "Root=1-5e66d96f-7491f09xmpl79d18acf3d050",
        },
        "multiValueHeaders": {
            "accept": [
                "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"
            ],
            "accept-encoding": [
                "gzip, deflate, br"
            ],
        },
        "queryStringParameters": undefined,
        "multiValueQueryStringParameters": null,
        "pathParameters": undefined,
        "stageVariables": undefined,
        "isBase64Encoded": false
    }
}

export default class ApiRequestFactory {

    private config: RequestInit;
    private cookie: string | null;
    endpoint: string;
    user?: Awaited<ReturnType<typeof createUserFactory>>["user"]
    session?: Awaited<ReturnType<typeof createUserFactory>>["session"]
    private promises: Promise<any>[]

    constructor(endpoint: string, body?: Object) {

        this.endpoint = endpoint;

        this.config = {
            headers: {
                "content-type": "application/json"
            }
        }

        if (body) {
            this.config.body = JSON.stringify(body)
        }

        this.promises = []

        this.cookie = null
    }

    get post() {
        this.config.method = "POST"
        return this
    }

    get patch() {
        this.config.method = "PATCH"
        return this
    }

    get delete() {
        this.config.method = "DELETE"
        return this
    }

    get get() {
        this.config.method = "GET"
        return this
    }

    addAuthSession() {
        this.promises.push(createUserFactory().then(({ user, session }) => {
            this.cookie = session.id
            this.user = user
        }))
        return this
    }

    setAuthSession(token: string) {
        this.cookie = token
        return this
    }

    async go() {

        if (this.promises.length) {
            await Promise.all(this.promises)
        }

        // add auth cookie
        if (this.cookie) {
            this.config.headers['Cookie'] = `${tokenCookieName}=${this.cookie}`
        }

        const event = createEvent(`http://localhost:3000/${this.endpoint}`, this.config.body, this.config.method, this.config.headers['Cookie'])

        // return app.request(this.endpoint, this.config)
        return handler(event)
    }
}