import { hc } from "hono/client"
import type { AppType } from "../../server"
import { getTokenCookie } from "./tokenCookie"

const client = hc<AppType>("/api", {
    headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${getTokenCookie()}`
    },
})

export default client