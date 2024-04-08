import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { entity } from "../../entities/team"
import type { ElectroError } from 'electrodb';
import { getAuthUserFromRequestEvent } from '../../utils/getAuthUserFromRequestEvent';

export default async function (request: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {

    if (request.httpMethod !== 'PUT' || !request.body) {
        return {
            statusCode: 401,
            body: JSON.stringify({
                message: 'Bad Request'
            })
        };
    }

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

    try {
        const { id: teamId } = request.pathParameters;
        const { name } = JSON.parse(request.body)
        // TODO: must be a more efficient way to return the updated record than getting again
        const team = await entity.patch({ id: teamId }).set({ name }).go()
            .then(async () => await entity.get({ id: teamId }).go())

        return {
            statusCode: 200,
            body: JSON.stringify(team.data)
        }
    } catch (e) {
        const error = e as ElectroError
        return {
            statusCode: 500,
            body: JSON.stringify(error)
        }
    }
}