import { app } from '../friendly-sites-api/index'
import { aws } from "bun"
import type { ApiContext, LambdaBindings } from '../friendly-sites-api/types';

const server = Bun.serve({
    port: 8423,
    async fetch(request) {

        // const { pathname } = new URL(request.url)

        // const env: LambdaBindings = {
        //     event: request.aws()
        // }

        // const res = await app.request(request, {
        //     method: "GET",
        //     headers: {
        //         "content-type": "application/json"
        //     }
        // }, env)

        // res.headers.set('Access-Control-Allow-Origin', '*');
        // res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        // res.headers.set('Access-Control-Allow-Headers', '*');

        // const res = await app.request(request)

        // res.headers.set('Access-Control-Allow-Origin', '*');
        // res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        // res.headers.set('Access-Control-Allow-Headers', '*');


        return app.fetch(request)
    }
})

process.on("exit", () => {
    server.stop()
});