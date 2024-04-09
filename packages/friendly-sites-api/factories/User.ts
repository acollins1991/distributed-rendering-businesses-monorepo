import { faker } from '@faker-js/faker';
import type { User } from '../entities/user';

function createUserFactory(overrides: Partial<User> = {}): User {

    const id = crypto.randomUUID()
    const first_name = faker.person.firstName()
    const last_name = faker.person.lastName()
    const email = faker.internet.email({
        firstName: first_name,
        lastName: last_name
    })

    return Object.assign({}, {
        id,
        first_name,
        last_name,
        email
    }, overrides)
}

export default createUserFactory