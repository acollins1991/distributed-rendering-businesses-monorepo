import { DynamoDBClient, ListTablesCommand } from "@aws-sdk/client-dynamodb"

const credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
}

const clientParams = {
    region: process.env.LOCALSTACK_REGION,
    endpoint: process.env.LOCALSTACK_ENDPOINT,
    credentials
}

console.log(credentials, clientParams)

const client = new DynamoDBClient(clientParams);

const table = "friendly_sites";

const listTablesCommand = new ListTablesCommand()

client.send(listTablesCommand).then(res => console.log(res))

export {
    table,
    client
}