import { Route53Client } from "@aws-sdk/client-route-53";

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

const client = new Route53Client(isDev || isTest ? clientParams : {});

export {
    client
}