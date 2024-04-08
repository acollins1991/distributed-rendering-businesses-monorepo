import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { entity } from "../entities/team"
import type { ElectroError } from 'electrodb';
import { getAuthUserFromRequestEvent } from '../utils/getAuthUserFromRequestEvent';

export default async function (request: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {

    if (request.httpMethod !== 'POST' || !request.body) {
        return {
            statusCode: 401,
            body: JSON.stringify({
                message: 'Bad Request'
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

        const { name, users } = JSON.parse(request.body)

        console.log(users ?? [user])

        const team = await entity.create({
            name,
            users: users ?? [user]

        }).go()

        return {
            statusCode: 200,
            body: JSON.stringify(team.params)
        }
    } catch (e) {

        const error = e as ElectroError

        return {
            statusCode: 500,
            body: JSON.stringify(error)
        }
    }
}