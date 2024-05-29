import { beforeAll } from "bun:test"
import { ensureHostedZoneExists, ensureTableExists } from "../packages/dashboard/utils/ensureResourcesExist"

beforeAll(async () => {
    await ensureTableExists()
    await ensureHostedZoneExists()
})