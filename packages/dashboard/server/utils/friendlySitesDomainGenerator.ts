import { faker } from "@faker-js/faker";

export function friendlySitesDomainGenerator() {
    return `${faker.word.words(5).replaceAll(' ', '-')}.friendly-sites.com`
}