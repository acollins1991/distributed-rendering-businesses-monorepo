import { client, table } from "../server/db"
import { CreateTableCommand, ListTablesCommand } from "@aws-sdk/client-dynamodb";
import * as tableDefinition from "../../../friendly-sites-api-table.json"

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