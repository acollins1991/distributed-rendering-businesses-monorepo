import { app } from "./server"
import { buildClient } from "./utils/buildClient"
import path from "path"
import { watch } from "fs";
import type { Serve, Server } from "bun";
import { ensureTableExists } from "./utils/ensureTableExists";

const clientBuild = await buildClient(path.join(__dirname, './dist/client'))

await ensureTableExists()

const serverOptions: Serve<unknown> = {
    port: 3000,
    fetch(req, server) {
        return app.fetch(req, { ip: server.requestIP(req) })
    }
}

const server = Bun.serve(serverOptions)

console.log(`Server running on http://${server.hostname}:${server.port}`)

// rebuild client files on change
const clientFilesWatcher = watch(path.join(__dirname, './client'), { recursive: true }, async (event, filename) => {
    await buildClient(path.join(__dirname, './dist/client'))
    console.log("rebuilt client script")
    server.reload(serverOptions)
});

process.on("exist", () => {
    server.stop()
    clientFilesWatcher.close()
    console.log('server stopped')
})