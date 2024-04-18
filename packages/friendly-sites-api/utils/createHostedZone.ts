import { Route53Client, CreateHostedZoneCommand, VPCRegion } from "@aws-sdk/client-route-53"

const credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
}

const clientParams = {
    region: 'us-west-1',
    endpoint: 'http://localstack:4566',
    credentials
}


const client = new Route53Client(clientParams);

export async function createHostedZone(domain: string) {
    console.log('domain ', domain)
    const input = {
        Name: domain,
        // VPC: {
        //     VPCRegion: 'us-west-1' as VPCRegion,
        // },
        CallerReference: domain, // required
        // HostedZoneConfig: {
        //     PrivateZone: false,
        // },
    };
    const command = new CreateHostedZoneCommand(input)

    return client.send(command)
}