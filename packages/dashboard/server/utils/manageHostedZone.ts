import { Route53Client, CreateHostedZoneCommand, DeleteHostedZoneCommand } from "@aws-sdk/client-route-53"

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

export async function createHostedZone(domain: string) {
    const input = {
        Name: domain,
        CallerReference: `${domain}--create`
    };
    const command = new CreateHostedZoneCommand(input)

    return client.send(command)
}

export async function deleteHostedZone(id: string) {
    const input = {
        Id: id,
        CallerReference: `${id}--delete`
    };
    const command = new DeleteHostedZoneCommand(input)

    return client.send(command)
}