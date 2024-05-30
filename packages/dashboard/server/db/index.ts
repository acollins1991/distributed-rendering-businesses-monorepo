import { DynamoDBClient } from "@aws-sdk/client-dynamodb"

const isDev = process.env.MODE === 'development'
const isTest = process.env.NODE_ENV === 'test'

const credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
}

const clientParams = {
    region: process.env.AWS_REGION,
    endpoint: process.env.LOCALSTACK_ENDPOINT,
    credentials
}

const client = new DynamoDBClient(isDev || isTest ? clientParams : {});

const table = "friendly_sites";

export {
    table,
    client
}