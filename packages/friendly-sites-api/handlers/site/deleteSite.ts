import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { entity } from "../../entities/site"
import { getAuthUserFromRequestEvent } from '../../utils/getAuthUserFromRequestEvent';
import friendlySitesAPIHandler from '../../utils/friendlySitesAPIHandler';

export default async function (request: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    return friendlySitesAPIHandler(request, 'DELETE', async (request: APIGatewayProxyEvent) => {
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

        const { teamId, siteId } = JSON.parse(request.body) as { teamId: string, siteId: string }
        const team = await entity.delete({ siteId }).go()

        return {
            statusCode: 200,
            body: JSON.stringify(team.data)
        }
    })
}
