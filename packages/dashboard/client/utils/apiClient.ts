import { hc } from "hono/client"
import type { AppType } from "../../server"

const client = hc<AppType>("/api")

export default client