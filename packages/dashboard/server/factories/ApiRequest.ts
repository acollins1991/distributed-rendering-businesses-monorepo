import { app } from "../honoApp";
import { tokenCookieName } from "../utils/authCookieName";
import createUserFactory from "./User";

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

        return app.request(this.endpoint, this.config)
    }
}