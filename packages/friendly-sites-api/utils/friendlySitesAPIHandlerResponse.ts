import type { APIGatewayProxyResult } from "hono/aws-lambda";

export default function (statusCode: number, body: string): APIGatewayProxyResult {
    return {
        isBase64Encoded: false,
        headers: {
            Content: "application/json"
        },
        statusCode,
        body
    }
}