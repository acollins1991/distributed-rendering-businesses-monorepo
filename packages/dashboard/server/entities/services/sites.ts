import { Service } from "electrodb";
import { entity as siteEntity } from "../site"
import { entity as templateEntity } from "../template"
import { client, table } from "../../db"

export const SitesService = new Service(
    {
        site: siteEntity,
        template: templateEntity,
    },
    { table, client },
);