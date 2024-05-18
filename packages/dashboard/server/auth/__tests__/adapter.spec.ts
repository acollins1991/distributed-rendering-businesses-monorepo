// heavily based on https://raw.githubusercontent.com/lucia-auth/lucia/main/packages/adapter-test/src/index.ts

import { describe, test, expect, beforeAll } from "bun:test"
import { faker } from "@faker-js/faker";
import type { DatabaseSession, DatabaseUser } from "lucia";
import { password as bunPassword } from "bun";
import { DynamoDBAdapter } from "../adapter";
import { entity as userEntity } from "../../entities/user";
import { entity as sessionEntity } from "../../entities/sessions";
import { add, sub } from "date-fns";

const userId = crypto.randomUUID()
const first_name = faker.person.firstName()
const last_name = faker.person.lastName()
const email = faker.internet.email({
    firstName: first_name.toLowerCase(),
    lastName: last_name.toLowerCase()
})
const password = faker.internet.password({
    length: 25
})
export const databaseUser: DatabaseUser = {
    id: userId,
    attributes: {
        userId,
        first_name,
        last_name,
        email,
        password_hash: bunPassword.hashSync(password),
        created_at: Date.now(),
        updated_at: Date.now()
    }
};

describe("DynamoDB lucia adapter", () => {

    const adapter = new DynamoDBAdapter()

    let databaseUser: DatabaseUser;
    let databaseSession: DatabaseSession

    const first_name = faker.person.firstName()
    const last_name = faker.person.lastName()
    const email = faker.internet.email({
        firstName: first_name.toLowerCase(),
        lastName: last_name.toLowerCase()
    })
    const password = faker.internet.password({
        length: 25
    })

    // create user and session in db
    beforeAll(async () => {
        // create and set user
        const userAttributes = {
            first_name,
            last_name,
            email,
            password_hash: bunPassword.hashSync(password),
        }
        const { data: user } = await userEntity.create(userAttributes).go()
        databaseUser = {
            id: user.userId,
            attributes: user
        }

        // setup session to be created later
        const sessionId = crypto.randomUUID()
        const sessionExpiresAt = add(Date.now(), {
            weeks: 2
        })
        databaseSession = {
            id: sessionId,
            userId: user.userId,
            expiresAt: sessionExpiresAt,
            attributes: {
                userId: user.userId,
                sessionId: sessionId,
                expires_at: sessionExpiresAt.getTime(),
                created_at: Date.now(),
                updated_at: Date.now()
            }
        }

    })

    test("getSessionAndUser() returns [null, null] on invalid session id", async () => {
        const result = await adapter.getSessionAndUser(databaseSession.id);
        expect(result).toEqual([null, null])
    })

    test("getUserSessions() returns empty array on invalid user id", async () => {
        const result = await adapter.getUserSessions(crypto.randomUUID());
        expect(result).toEqual([])
    })

    test("setSession() creates session and getSessionAndUser() returns created session and associated user", async () => {
        await adapter.setSession(databaseSession);
        const [resultSession, resultUser] = await adapter.getSessionAndUser(databaseSession.id);

        expect(resultSession?.userId).toBe(databaseUser.id)
        expect(resultUser?.id).toBe(databaseUser.id)
    });

    test("getUserSessions() gets all sessions, only databaseSession here", async () => {
        const result = await adapter.getUserSessions(databaseSession.userId);
        expect(result.length).toBe(1)
        expect(result[0].id).toBe(databaseSession.id)
    })

    test("deleteSession() deletes session", async () => {
        await adapter.deleteSession(databaseSession.id);
        const result = await adapter.getUserSessions(databaseSession.userId);
        expect(result).toEqual([])
        // confirm it's gone from the db
        expect((await sessionEntity.get({ sessionId: databaseSession.id }).go()).data).toEqual(null)
    });

    test("updateSessionExpiration() updates session", async () => {
        // create new session from predefined values
        await adapter.setSession(databaseSession);
        const newExpiresDate = new Date(databaseSession.expiresAt.getTime() + 10_000);
        await adapter.updateSessionExpiration(databaseSession.id, newExpiresDate);
        const [resultSession] = await adapter.getSessionAndUser(databaseSession.id);
        expect(resultSession?.expiresAt).toEqual(newExpiresDate)
    });

    test("deleteExpiredSessions() deletes all expired sessions", async () => {
        const expiredSessionId = crypto.randomUUID()
        const expiredSessionExpiresAt = sub(Date.now(), {
            months: 6
        })
        const expiredSession: DatabaseSession = {
            id: expiredSessionId,
            userId: databaseUser.id,
            expiresAt: expiredSessionExpiresAt,
            attributes: {
                sessionId: expiredSessionId,
                userId: databaseUser.id,
                expires_at: expiredSessionExpiresAt.getTime(),
                created_at: Date.now(),
                updated_at: Date.now()
            }
        }

        await adapter.setSession(expiredSession);
        await adapter.deleteExpiredSessions();
        const result = await adapter.getUserSessions(databaseUser.id);
        // only gets non-expired session
        expect(result.length).toBe(1)
        expect(result[0].id).toEqual(databaseSession.id)
    });

    test("deleteUserSessions() deletes all user sessions", async () => {
        await adapter.deleteUserSessions(databaseSession.userId);
        const result = await adapter.getUserSessions(databaseSession.userId);
        expect(result).toEqual([])
    });
})