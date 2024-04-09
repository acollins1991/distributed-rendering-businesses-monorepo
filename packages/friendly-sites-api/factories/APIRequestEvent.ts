import type { APIGatewayProxyEvent } from "aws-lambda";
import { mock } from "vitest-mock-extended"
import type { User } from "../entities/user";

function createAPIRequestEvent(
    httpMethod: APIGatewayProxyEvent['httpMethod'],
    user: User,
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
                    sub: user.id
                }
            }
        }
    })
}

export default createAPIRequestEvent