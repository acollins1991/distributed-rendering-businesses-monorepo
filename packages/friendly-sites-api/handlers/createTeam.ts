import type { CloudFrontRequestEvent, CloudFrontResponseResult, CloudFrontRequestResult } from 'aws-lambda';
import { client as db } from "../db/index"

export default async function (event: CloudFrontRequestEvent): Promise<CloudFrontResponseResult | CloudFrontRequestResult> {

    const request = event.Records[0].cf.request;

    if (request.method !== 'POST') {
        return request;
    }

    if (!request.body) {
        return {
            status: '400',
            statusDescription: 'Bad Request',
        }
    }

    const body = Buffer.from(request.body.data, 'base64').toString();
    const parsedData = new URLSearchParams(body);

    // Do something

    return {
        status: '201',
        statusDescription: 'Created',
    }
}