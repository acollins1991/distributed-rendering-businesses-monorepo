import { client, table } from "../server/db"
import { CreateTableCommand, ListTablesCommand } from "@aws-sdk/client-dynamodb";
import * as tableDefinition from "../../../friendly-sites-api-table.json"
import { createHostedZone } from "../server/utils/manageHostedZone";
import { client as route53Client } from "../server/utils/route53Client"
import { ListHostedZonesCommand } from "@aws-sdk/client-route-53";

export async function ensureTableExists() {
    const listTablesCommand = new ListTablesCommand()
    const tables = await client.send(listTablesCommand)

    if (tables.TableNames?.length) {
        return
    }

    const createTableCommand = new CreateTableCommand({
        TableName: table,
        ...tableDefinition
    })
    return await client.send(createTableCommand)
}

export async function ensureHostedZoneExists() {
    try {
        await createHostedZone(process.env.DEFAULT_HOSTED_ZONE_NAME as string)
    } catch (e) {
        console.log(e)
    }
}