import { DynamoDBClient } from "@aws-sdk/client-dynamodb"

const credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
}

const clientParams = {
    region: 'us-west-1',
    endpoint: 'http://localstack:4566',
    credentials
}

const client = new DynamoDBClient(clientParams);

const table = "friendly_sites";

export {
    table,
    client
}