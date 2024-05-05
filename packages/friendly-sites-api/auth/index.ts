import { Lucia } from "lucia";
import { DynamoDBAdapter } from "./adapter";
import type { User } from "../entities/user";
import type { Session } from "../entities/sessions";

type UserWithoutPassword = Omit<User, 'password_hash'>

export const auth = new Lucia(new DynamoDBAdapter(), {
    // we don't need to expose the password hash!
    getUserAttributes: (attributes): UserWithoutPassword => {
        const { userId, first_name, last_name, email, created_at, updated_at } = attributes
        return { userId, first_name, last_name, email, created_at, updated_at };
    }
})

declare module "lucia" {
    interface Register {
        Lucia: typeof auth;
        DatabaseUserAttributes: User;
        DatabaseSessionAttributes: {
            expires_at: ReturnType<typeof Date.now>
        }
    }
}

