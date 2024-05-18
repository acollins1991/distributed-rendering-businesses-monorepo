import { app } from "./server"
import { buildClient } from "./utils/buildClient"
import path from "path"
import { watch } from "fs";

const clientBuild = await buildClient(path.join(__dirname, './dist/client'))

const server = Bun.serve({
    port: 3000,
    fetch(req, server) {
        return app.fetch(req, { ip: server.requestIP(req) })
    }
})

// rebuild client files on change
const clientFilesWatcher = watch(path.join(__dirname, './client'), async (event, filename) => {
    await buildClient(path.join(__dirname, './dist/client'))
    console.log("rebuilt client script")
});

process.on("exist", () => {
    server.stop()
    clientFilesWatcher.close()
    console.log('server stopped')
})