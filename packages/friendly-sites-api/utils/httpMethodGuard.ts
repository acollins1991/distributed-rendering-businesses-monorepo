import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

function httpMethodGuard(method: 'GET' | 'DELETE' | 'POST' | 'PUT', request: APIGatewayProxyEvent): APIGatewayProxyResult | void {
    if (request.httpMethod !== method) {
        return {
            statusCode: 401,
            body: JSON.stringify({
                message: 'Bad Request'
            })
        };
    }
}

export default httpMethodGuard