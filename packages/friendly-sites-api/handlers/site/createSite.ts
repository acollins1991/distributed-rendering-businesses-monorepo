import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { entity } from "../../entities/site"
import { getAuthUserFromRequestEvent } from '../../utils/getAuthUserFromRequestEvent';
import friendlySitesAPIHandler from '../../utils/friendlySitesAPIHandler';
import { faker } from "@faker-js/faker"
import { createHostedZone } from '../../utils/manageHostedZone';

export default async function (request: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    return friendlySitesAPIHandler(request, 'POST', async (request: APIGatewayProxyEvent) => {
        const user = getAuthUserFromRequestEvent(request)

        if (typeof user !== 'string') {
            return {
                statusCode: 403,
                body: JSON.stringify({
                    message: 'Not authorised'
                })
            }
        }

        const { teamId, name, domain: reqDomain } = JSON.parse(request.body as string)

        const domain = reqDomain ? reqDomain : `${faker.word.words(5).replaceAll(' ', '-')}.friendly-sites.com`
        const hostedZone = await createHostedZone(domain)

        const team = await entity.create({
            teamId,
            name,
            domain,
            hosted_zone: hostedZone.HostedZone?.Id as string

        }).go()

        return {
            statusCode: 200,
            body: JSON.stringify(team.data)
        }
    })
}
