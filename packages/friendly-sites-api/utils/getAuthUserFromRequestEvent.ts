import type { APIGatewayEvent } from 'aws-lambda';

type CognitoUser = {
    sub: string;
}

type CognitoClaims = {
    sub: string;
}

export function getAuthUserFromRequestEvent(event: APIGatewayEvent): CognitoUser['sub'] | Error {
    try {
        // Access user information from Cognito claims
        const claims = (event.requestContext as any).authorizer.claims as CognitoClaims;

        if (!claims.sub) {
            return Error('Error accessing Cognito claims: no claim sub');
        }

        return claims.sub;
    } catch (error) {
        return Error(`Error accessing Cognito claims: ${error}`);
    }
}