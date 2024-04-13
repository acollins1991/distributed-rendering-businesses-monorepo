import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { entity } from "../../entities/site"
import { getAuthUserFromRequestEvent } from '../../utils/getAuthUserFromRequestEvent';
import friendlySitesAPIHandler from '../../utils/friendlySitesAPIHandler';

export default async function (request: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    return friendlySitesAPIHandler(request, 'POST', async (request: APIGatewayProxyEvent) => {
        const user = getAuthUserFromRequestEvent(request)

        if (typeof user !== 'string') {
            return {
                statusCode: 403,
                body: JSON.stringify({
                    message: 'Not authorised'
                })
            }
        }

        const { teamId, name } = JSON.parse(request.body)
        const team = await entity.create({
            teamId,
            name

        }).go()

        return {
            statusCode: 200,
            body: JSON.stringify(team.data)
        }
    })
}
