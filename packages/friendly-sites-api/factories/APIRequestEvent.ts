import type { APIGatewayProxyEvent } from "aws-lambda";
import { mock } from "vitest-mock-extended"

function createAPIRequestEvent(
    httpMethod: APIGatewayProxyEvent['httpMethod'],
    userSub: string,
    body: APIGatewayProxyEvent['body'] = '',
    pathParameters: APIGatewayProxyEvent['pathParameters'] = {},
    queryStringParameters: APIGatewayProxyEvent['queryStringParameters'] = {},
): APIGatewayProxyEvent {

    return Object.assign({}, mock<APIGatewayProxyEvent>(), {
        httpMethod,
        body,
        pathParameters,
        queryStringParameters,
        requestContext: {
            authorizer: {
                claims: {
                    sub: userSub
                }
            }
        }
    })
}

export default createAPIRequestEvent