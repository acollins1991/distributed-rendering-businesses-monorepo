import type { Serve } from "bun";
import { ensureTableExists } from "./utils/ensureResourcesExist";
import { app } from "./honoApp";
import { handler } from "./handler";
import type { LambdaEvent } from "hono/aws-lambda";

await ensureTableExists()

async function transformRequestToLambdaEvet(req: Request): Promise<LambdaEvent> {
    const body = req.body ?? await req.text()
    const event: LambdaEvent = {
        httpMethod: req.method,
        path: new URL(req.url).pathname,
        body,
        isBase64Encoded: false,
        requestContext: {}
    }
    return event
}

async function resHandler(req: Request) {
    // const res = await app.fetch(req)

    // console.log(await handler(await transformRequestToLambdaEvet(req)))

    const res = await handler(await transformRequestToLambdaEvet(req))

    console.log(res)

    return res

    // need to add these here as they are not being added by Hono, even using the cors middleware
    res.headers.set('Access-Control-Allow-Origin', "http://localhost:8080");
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.headers.set('Access-Control-Allow-Credentials', 'true');

    return res
}

const serverOptions: Serve<unknown> = {
    port: 3000,
    fetch: resHandler
}

const server = Bun.serve(serverOptions)

console.log(`Server running at http://${server.hostname}:${server.port}`)

process.on("exit", () => {
    server.stop()
    console.log('server stopped')
})

