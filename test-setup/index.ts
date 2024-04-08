import { beforeAll, afterAll } from "bun:test"
import { $ } from "bun";
import { table } from "../packages/friendly-sites-api/db/index"

const region = 'us-west-1'
const endpointUrl = 'http://localstack:4566'

beforeAll(async () => {
    // setup table
    await $`aws --region=${region} --endpoint-url=${endpointUrl} dynamodb create-table --cli-input-json file://friendly-sites-api-table.json --table-name=${table} > /dev/null`;
})

afterAll(async () => {
    // teardown table
    await $`aws --region=${region} --endpoint-url=${endpointUrl} dynamodb delete-table --table-name=${table} > /dev/null`;
})