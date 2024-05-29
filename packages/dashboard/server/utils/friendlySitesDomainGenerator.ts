import { faker } from "@faker-js/faker";

export function friendlySitesDomainGenerator() {
    return `${faker.word.words(5).replaceAll(' ', '-')}.${process.env.DEFAULT_HOSTED_ZONE_NAME}`
}