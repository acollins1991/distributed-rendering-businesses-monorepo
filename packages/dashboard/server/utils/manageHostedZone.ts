import { CreateHostedZoneCommand, DeleteHostedZoneCommand, ChangeResourceRecordSetsCommand, type ChangeResourceRecordSetsCommandInput, GetHostedZoneCommand, ListHostedZonesByNameCommand, type HostedZone } from "@aws-sdk/client-route-53"
import { client as route53Client } from "./route53Client";
import { getDefaultCloudfrontDistribution } from "./taggedResources"

export async function createHostedZone(domain: string) {
    const input = {
        Name: domain,
        CallerReference: `${domain}--create`
    };
    const command = new CreateHostedZoneCommand(input)

    return route53Client.send(command)
}

export async function deleteHostedZone(id: string) {
    const input = {
        Id: id,
        CallerReference: `${id}--delete`
    };
    const command = new DeleteHostedZoneCommand(input)

    return route53Client.send(command)
}

let default_hosted_zone: HostedZone
export async function getDefaultHostedZone() {
    if (default_hosted_zone) {
        return default_hosted_zone
    }
    const command = new ListHostedZonesByNameCommand()
    const zones = await route53Client.send(command)
    const zone = zones.HostedZones?.find(zone => zone.Name === `${process.env.DEFAULT_HOSTED_ZONE_NAME}.`)
    if (!zone) {
        throw new Error('Unable to find default hosted zone')
    }
    default_hosted_zone = zone
    return default_hosted_zone
}

export async function addFriendlySitesDNSRecord(name: string) {
    try {
        const defaultHostedZone = await getDefaultHostedZone()
        const distribution = await getDefaultCloudfrontDistribution()
        const input: ChangeResourceRecordSetsCommandInput = {
            HostedZoneId: defaultHostedZone.Id,
            ChangeBatch: {
                Changes: [
                    {
                        Action: "CREATE",
                        ResourceRecordSet: {
                            Name: name,
                            ResourceRecords: [
                                {
                                    Value: distribution.DomainName
                                },
                            ],
                            Type: "A"
                        },
                    },
                ],
            },
        };
        const command = new ChangeResourceRecordSetsCommand(input);
        return route53Client.send(command);
    } catch (error) {
        console.log(error)
        throw new Error("Error creating DNS record")
    }
}