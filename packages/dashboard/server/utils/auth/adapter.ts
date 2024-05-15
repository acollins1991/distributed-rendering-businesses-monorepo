import type { Adapter, DatabaseSession, DatabaseUser, UserId } from "lucia";
import { Session, sessionEntity } from "../entities/sessions";
import { User, userEntity } from "../entities/user"
import { add } from "date-fns"
import type { Duration } from "date-fns";

function convertSessionInterface(session: Session): DatabaseSession {
    return {
        id: session.sessionId,
        userId: session.userId,
        expiresAt: new Date(session.expires_at),
        attributes: session
    }
}

function convertUserInterface(user: User): DatabaseUser {
    return {
        id: user.userId,
        attributes: user
    }
}

type DynamoDBAdapterOptions = {
    expiration_duration?: Duration
}

const adapterOptionsDefaults: DynamoDBAdapterOptions = {
    expiration_duration: {
        months: 3
    }
}

export class DynamoDBAdapter implements Adapter {

    private options: NonNullable<DynamoDBAdapterOptions>;

    constructor(options: DynamoDBAdapterOptions = {}) {
        this.options = Object.assign({}, adapterOptionsDefaults, options)
    }

    public async deleteSession(sessionId: string): Promise<void> {
        await sessionEntity.delete({ sessionId }).go()
    }

    public async deleteUserSessions(userId: string): Promise<void> {
        const sessions = await this.getUserSessions(userId)
        const sessionIdsArray = sessions.map(session => ({ sessionId: session.id }))
        await sessionEntity.delete(sessionIdsArray).go()
    }

    public async getSessionAndUser(
        sessionId: string
    ): Promise<[session: DatabaseSession | null, user: DatabaseUser | null]> {

        const { data: session } = await sessionEntity.get({ sessionId }).go()

        if (!session) {
            return [null, null]
        }

        const { data: user } = await userEntity.get({ userId: session.userId }).go()

        if (!user) {
            return [null, null]
        }

        // make session and user interfaces confirm to electrodb
        return [convertSessionInterface(session), convertUserInterface(user)]
    }

    private async getSession(sessionId: string): Promise<DatabaseSession | null> {
        const { data: session } = await sessionEntity.get({ sessionId }).go()

        if (!session) {
            return null
        }

        return convertSessionInterface(session)
    }

    private async getUserFromSessionId(sessionId: string): Promise<DatabaseUser | null> {

        const session = await this.getSession(sessionId)

        if (!session) {
            return null
        }

        const { data: user } = await userEntity.get({ userId: session.userId }).go()

        if (!user) {
            return null
        }

        return convertUserInterface(user)
    }

    public async getUserSessions(userId: UserId): Promise<DatabaseSession[]> {
        const { data } = await sessionEntity.query.user_sessions({ userId }).go()
        return data.map(session => convertSessionInterface(session))
    }

    public async updateSessionExpiration(sessionId: string, expiresAt: Date): Promise<void> {
        await sessionEntity.patch({ sessionId }).set({ expires_at: expiresAt.getTime() }).go()
    }

    public async setSession(session: DatabaseSession): Promise<void> {
        await sessionEntity.create({
            sessionId: session.id,
            userId: session.userId,
            // set expires_at to time set by options into the future
            expires_at: session.expiresAt?.getTime() ?? add(Date.now(), this.options.expiration_duration as Duration).getTime()
        }).go()
    }

    // TODO: setup cron job to trigger this
    public async deleteExpiredSessions(): Promise<void> {
        const { data: allSexpiredSessions } = await sessionEntity.scan.where(({ expires_at }, { lt }) => `
            ${lt(expires_at, Date.now())}
        `).go()

        // delete all expired sessions
        await sessionEntity.delete(allSexpiredSessions.map(session => ({ sessionId: session.sessionId }))).go()
    }
}