import type { Distribution } from "@aws-sdk/client-cloudfront";
import { client as cloudfrontClient } from "./cloudfrontClient"
import { client as route53Client } from "./route53Client"
import { ResourceGroupsTaggingAPI, GetResourcesCommand, type GetResourcesCommandInput } from "@aws-sdk/client-resource-groups-tagging-api";
import { ListHostedZonesCommand, type HostedZone } from "@aws-sdk/client-route-53";

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

const clientArgs = Object.assign({}, isDev || isTest ? clientParams : {})

const client = new ResourceGroupsTaggingAPI(clientArgs)

let default_cloudfront_distribution: Distribution;
export async function getDefaultCloudfrontDistribution() {

    if (default_cloudfront_distribution) {
        return default_cloudfront_distribution
    }

    const usEast1Client = new ResourceGroupsTaggingAPI(Object.assign({}, clientArgs, { region: "us-east-1" }))

    const input: GetResourcesCommandInput = {
        ResourceTypeFilters: ["cloudfront"],
        TagFilters: [
            {
                Key: process.env.DEFAULT_CLOUDFRONT_DISTRIBUTION_ID
            }
        ]
    }

    const command = new GetResourcesCommand(input)
    const resouces = await usEast1Client.send(command)
    const distributionList = resouces.ResourceTagMappingList

    if (!distributionList.length) {
        throw Error('No distribution found from tagged resources')
    }

    const distributionARN = distributionList[0].ResourceARN

    if (!distributionARN) {
        throw Error('Unable to get cloudfront ARN')
    }

    const distributionId = distributionARN.split("/")[distributionARN.split("/").length - 1];
    const distributionResponse = await cloudfrontClient.getDistribution({ Id: distributionId });
    const distribution = distributionResponse.Distribution;

    if (!distribution) {
        throw Error('Unable to get cloudfront distribution')
    }

    // cache value
    default_cloudfront_distribution = distribution

    return default_cloudfront_distribution
}