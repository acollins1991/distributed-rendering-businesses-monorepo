import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

type FriendlySitesAPIHandleryFn = (request: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>
type HTTPMethod = 'GET' | 'DELETE' | 'POST' | 'PUT'

function httpMethodGuard(method: HTTPMethod, request: APIGatewayProxyEvent): boolean {
    return request.httpMethod === method
}

export default async function (request: APIGatewayProxyEvent, method: HTTPMethod, fn: FriendlySitesAPIHandleryFn): Promise<APIGatewayProxyResult> {

    if (!httpMethodGuard(method, request)) {
        return {
            statusCode: 401,
            body: JSON.stringify({
                message: 'Bad Request: HTTP method'
            })
        };
    }

    try {
        return fn(request)
    } catch (e) {
        return {
            statusCode: 500,
            body: JSON.stringify(e)
        }
    }
}