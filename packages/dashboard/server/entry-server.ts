import type { Serve } from "bun";
import { ensureTableExists } from "../utils/ensureResourcesExist";
import { app } from "./honoApp";

await ensureTableExists()

const serverOptions: Serve<unknown> = {
    port: 3000,
    fetch(req, server) {
        return app.fetch(req, { ip: server.requestIP(req) })
    }
}

const server = Bun.serve(serverOptions)

console.log(`Server running at http://${server.hostname}:${server.port}`)

process.on("exit", () => {
    server.stop()
    console.log('server stopped')
})

