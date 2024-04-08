import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { entity } from "../../entities/team"
import type { ElectroError } from 'electrodb';
import { getAuthUserFromRequestEvent } from '../../utils/getAuthUserFromRequestEvent';
import friendlySitesAPIHandler from '../../utils/friendlySitesAPIHandler';

export default async function (request: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    return friendlySitesAPIHandler(request, 'DELETE', async (request: APIGatewayProxyEvent) => {
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
        // TODO: must be a more efficient way to return the updated record than getting again
        const team = await entity.get({ id: teamId }).go()

        await entity.delete({ id: teamId }).go()

        return {
            statusCode: 200,
            body: JSON.stringify(team.data)
        }
    })
}