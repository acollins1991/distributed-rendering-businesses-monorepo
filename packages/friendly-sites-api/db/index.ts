import { DynamoDBClient } from "@aws-sdk/client-dynamodb"

const client = new DynamoDBClient();

const table = "friendly_sites";

export {
    table,
    client
}