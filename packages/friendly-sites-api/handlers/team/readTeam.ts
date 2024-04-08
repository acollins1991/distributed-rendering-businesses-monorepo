import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { entity } from "../../entities/team"
import { getAuthUserFromRequestEvent } from '../../utils/getAuthUserFromRequestEvent';
import friendlySitesAPIHandler from '../../utils/friendlySitesAPIHandler';

export default async function (request: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    return friendlySitesAPIHandler(request, 'GET', async (request: APIGatewayProxyEvent) => {
        if (!request.pathParameters || !request.pathParameters['id']) {
            return {
                statusCode: 401,
                body: JSON.stringify({
                    message: 'Bad Request: missing team id'
                })
            };
        }

        const user = getAuthUserFromRequestEvent(request)

        if (typeof user !== 'string') {
            return {
                statusCode: 403,
                body: JSON.stringify({
                    message: 'Not authorised'
                })
            }
        }

        const { id: teamId } = request.pathParameters;
        const team = await entity.get({ id: teamId }).go()

        return {
            statusCode: 200,
            body: JSON.stringify(team.data)
        }
    })
}