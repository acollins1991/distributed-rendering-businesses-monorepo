import type { Serve } from "bun";
import { ensureTableExists } from "./utils/ensureResourcesExist";
import { app } from "./honoApp";

await ensureTableExists()

async function resHandler(req: Request) {
    const res = await app.fetch(req)

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

