import { faker } from '@faker-js/faker';
import { entity as userEntity, type User } from '../entities/user';
import { entity as sessionEntity, type Session } from "../entities/sessions"
import { password as bunPassword } from "bun"
import { add } from 'date-fns';
import { auth } from '../auth';

type UserFactoryOverrised = Partial<Omit<User, 'password_hash'> & { password: string }>

async function createUserFactory(overrides: UserFactoryOverrised = {}): Promise<{
    user: User,
    session: Awaited<ReturnType<typeof auth.createSession>>
}> {

    const first_name = faker.person.firstName()
    const last_name = faker.person.lastName()
    const email = faker.internet.email({
        firstName: first_name,
        lastName: last_name
    })
    const password = faker.internet.password({
        length: 16
    })

    const userObject = Object.assign({}, {
        first_name,
        last_name,
        email,
        password
    }, overrides)


    // create user record
    const { data: user } = await userEntity.create({
        first_name: userObject.first_name,
        last_name: userObject.last_name,
        email: userObject.email,
        password_hash: await bunPassword.hash(userObject.password)
    }).go()

    // create user session
    const session = await auth.createSession(user.userId, {
        expires_at: add(Date.now(), {
            months: 1
        }).getTime()
    })

    return {
        user,
        session
    }
}

export default createUserFactory