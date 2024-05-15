import createEvent from "@serverless/event-mocks"
import { app } from "./packages/friendly-sites-api";

const healtcheck = await fetch('http://localstack:4566/_localstack/health')

console.log(healtcheck)

const server = Bun.serve({
    port: 9385,
    async fetch(request) {

        const url = new URL(request.url)
        const searchParams = url.searchParams
        const body = request.body ?
            await new Response(request.body).text() : null

        const event = createEvent(
            "aws:apiGateway",
            {
                path: url.pathname,
                body,
                httpMethod: request.method,
                queryStringParameters: Object.fromEntries(searchParams)
            });

        const res = await app.request(url.pathname, {
            method: event.httpMethod,
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({})
        }, {
            event
        })

        return res
    },
})

process.on("exit", (code) => {
    server.stop()
    console.log('server stopped')
});

console.log(`Listening on ${server.url}`);
