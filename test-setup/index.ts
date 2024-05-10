import { beforeAll, afterAll } from "bun:test"
import { $ } from "bun";
import { table } from "../packages/friendly-sites-api/db/index"

const region = process.env.LOCALSTACK_REGION
const endpointUrl = process.env.LOCALSTACK_ENDPOINT

console.log(region)
console.log(endpointUrl)

beforeAll(async () => {
    // setup table
    await $`aws --region=${region} --endpoint-url=${endpointUrl} dynamodb create-table --cli-input-json file://friendly-sites-api-table.json --table-name=${table} > /dev/null`;
})

afterAll(async () => {
    // teardown table
    await $`aws --region=${region} --endpoint-url=${endpointUrl} dynamodb delete-table --table-name=${table} > /dev/null`;
})