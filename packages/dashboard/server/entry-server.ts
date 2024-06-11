import { buildClient } from "../utils/buildClient"
import path from "path"
import { watch } from "fs";
import type { Serve } from "bun";
import { ensureTableExists } from "../utils/ensureResourcesExist";
import { app } from "./honoApp";

const isDev = process.env.MODE === 'development'

await ensureTableExists()

const serverOptions: Serve<unknown> = {
    port: 3000,
    fetch(req, server) {
        return app.fetch(req, { ip: server.requestIP(req) })
    }
}

const server = Bun.serve(serverOptions)

console.log(`Server running at http://${server.hostname}:${server.port}`)

if (isDev) {
    buildClient(path.join(__dirname, '../dist/client'))
    const clientFilesWatcher = watch(path.join(__dirname, '../client'), { recursive: true }, async (event, filename) => {
        await buildClient(path.join(__dirname, '../dist/client'))
        console.log("rebuilt client script")
        server.reload(serverOptions)
    });
    process.on("exit", () => {
        clientFilesWatcher.close()
    })
}

process.on("exit", () => {
    server.stop()
    console.log('server stopped')
})

export type AppType = typeof app

