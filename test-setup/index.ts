import { beforeAll, afterAll } from "bun:test"
import { $ } from "bun";
import { table } from "../packages/friendly-sites-api/db/index"

beforeAll(async () => {
    await $`aws --region=us-west-1 --endpoint-url=http://localstack:4566 dynamodb create-table --cli-input-json file://friendly-sites-api-table.json --table-name=${table}`;
})

afterAll(async () => {
    await $`aws --region=us-west-1 --endpoint-url=http://localstack:4566 dynamodb delete-table --table-name=${table}`;
})