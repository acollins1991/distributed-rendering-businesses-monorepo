import type { Serve } from "bun";
import { ensureTableExists } from "../utils/ensureResourcesExist";
import { app } from "./honoApp";

await ensureTableExists()

async function resHandler(req: Request) {
    const res = await app.fetch(req)
    // need to add these here as they are not being added by Hono, even using the cors middleware
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    return res
}

const serverOptions: Serve<unknown> = {
    port: 3000,
    fetch(req, server) {
        return resHandler(req)
    //  const res = await app.fetch(req, { ip: server.requestIP(req) })
    //     res.headers.set('Access-Control-Allow-Origin', '*');
    // res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    }
}

const server = Bun.serve(serverOptions)

console.log(`Server running at http://${server.hostname}:${server.port}`)

process.on("exit", () => {
    server.stop()
    console.log('server stopped')
})

