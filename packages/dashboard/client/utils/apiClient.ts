import { hc } from "hono/client"
import type { AppType } from "../../server/entry-server"

const client = hc<AppType>("/api", {
    headers: {
        "Content-Type": "application/json",
    },
})

export default client