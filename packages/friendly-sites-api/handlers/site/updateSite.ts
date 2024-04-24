import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { entity } from "../../entities/site"
import { getAuthUserFromRequestEvent } from '../../utils/getAuthUserFromRequestEvent';
import friendlySitesAPIHandler from '../../utils/friendlySitesAPIHandler';
import { deleteHostedZone } from '../../utils/manageHostedZone';

export default async function (request: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    return friendlySitesAPIHandler(request, 'PUT', async (request: APIGatewayProxyEvent) => {
        const user = getAuthUserFromRequestEvent(request)

        if (typeof user !== 'string') {
            return {
                statusCode: 403,
                body: JSON.stringify({
                    message: 'Not authorised'
                })
            }
        }

        if (typeof request.body !== 'string') {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Missing body'
                })
            }
        }

        const patchObject = JSON.parse(request.body as string)

        if (!request.pathParameters) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Missing ID path parameter'
                })
            }
        }

        const { id: siteId } = request.pathParameters;

        const { data: existingRecord } = await entity.get({ siteId }).go()

        if (!existingRecord) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: `Site ${siteId} record not found`
                })
            }
        }

        const updatedRecordCommand = entity.patch({ siteId })
            .set(patchObject)

        // if domain has changed 
        if (patchObject.domain !== existingRecord?.domain) {
            deleteHostedZone(existingRecord.hosted_zone)
        }

        const updatedRecord = await updatedRecordCommand.go()

        return {
            statusCode: 200,
            body: JSON.stringify(team.data)
        }
    })
}
