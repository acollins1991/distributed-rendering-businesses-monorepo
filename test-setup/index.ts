import { beforeAll } from "bun:test"
import { ensureTableExists } from "../packages/dashboard/utils/ensureTableExists"

beforeAll(async () => {
    await ensureTableExists()
})