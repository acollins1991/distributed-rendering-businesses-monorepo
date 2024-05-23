import { DynamoDBClient } from "@aws-sdk/client-dynamodb"

const credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
}

const clientParams = {
    region: process.env.AWS_REGION,
    endpoint: process.env.LOCALSTACK_ENDPOINT,
    credentials
}

console.log(credentials, clientParams)

const client = new DynamoDBClient(clientParams);

const table = "friendly_sites";

export {
    table,
    client
}