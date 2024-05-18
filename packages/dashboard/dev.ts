import { app } from "./server"

const server = Bun.serve({
    port: 3000,
    fetch(req, server) {
        return app.fetch(req, { ip: server.requestIP(req) })
    }
})

console.log('server started on http://localhost:3000')

process.on("exist", () => {
    server.stop()
    console.log('server stopped')
})