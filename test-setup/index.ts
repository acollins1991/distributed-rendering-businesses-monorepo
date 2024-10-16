import { beforeAll } from "bun:test"
import { ensureHostedZoneExists, ensureTableExists } from "../packages/api/utils/ensureResourcesExist"

beforeAll(async () => {
    await ensureTableExists()
    await ensureHostedZoneExists()
})