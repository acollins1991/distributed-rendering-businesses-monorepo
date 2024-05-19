import { app } from "..";
import createUserFactory, { type UserFactoryOverride } from "./User";

export default class ApiRequestFactory {

    private config: RequestInit;
    endpoint: string;
    user?: Awaited<ReturnType<typeof createUserFactory>>["user"]
    session?: Awaited<ReturnType<typeof createUserFactory>>["session"]

    constructor(endpoint: string, body: Object) {

        this.endpoint = endpoint;

        this.config = {
            headers: {
                "content-type": "application/json"
            }
        }

        if (body) {
            this.config.body = JSON.stringify(body)
        }
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

    async addAuthUser(userSettings?: UserFactoryOverride) {

        if (this.user) {
            throw Error("User already set")
        }

        const { session } = userSettings ? await createUserFactory(userSettings) : await createUserFactory()
        this.config.headers["authorization"] = `Bearer ${session.id}`
        return this
    }

    setAuthSession(token: string) {
        this.config.headers["authorization"] = `Bearer ${token}`
        return this
    }

    async go() {
        return app.request(this.endpoint, this.config)
    }
}