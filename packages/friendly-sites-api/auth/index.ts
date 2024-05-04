import { Lucia } from "lucia";
import { DynamoDBAdapter } from "./adapter";
import type { EntityItem } from "electrodb";
import type { User } from "../entities/user";

export const auth = new Lucia(new DynamoDBAdapter(), {})

declare module "lucia" {
    interface Register {
        Lucia: typeof auth;
        DatabaseUserAttributes: User;
    }
}

