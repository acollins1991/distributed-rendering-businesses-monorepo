import type { LambdaBindings } from '../../types';
import type { APIGatewayProxyResult } from 'hono/aws-lambda'
import friendlySitesAPIHandlerResponse from './friendlySitesAPIHandlerResponse';

type FriendlySitesAPIHandleryFn = (request: LambdaBindings) => Promise<APIGatewayProxyResult>

export default async function (request: LambdaBindings, fn: FriendlySitesAPIHandleryFn): Promise<APIGatewayProxyResult> {
    try {
        return fn(request)
    } catch (e) {
        return friendlySitesAPIHandlerResponse(500, JSON.stringify(e))
    }
}