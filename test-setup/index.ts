import { beforeAll, afterAll } from "bun:test"
import { $ } from "bun";

beforeAll(async () => {
    await $`aws --region=us-west-1 --endpoint-url=http://localstack:4566 dynamodb create-table --cli-input-json file://friendly-sites-api-table.json`;
})

afterAll(async () => {
    await $`aws --region=us-west-1 --endpoint-url=http://localstack:4566 dynamodb delete-table --table-name=friendly-sites-api`;
})