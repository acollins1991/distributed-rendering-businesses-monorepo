import createNewEntity from "./createNewEntity";

export type User = {
    id: string
    first_name: string
    last_name: string
    email: string
}

function isValidEmail(email: string): boolean {
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(email);
}

export const entity = createNewEntity('user', 'users', {
    first_name: {
        type: "string",
        required: true
    },
    last_name: {
        type: "string",
        required: true
    },
    email: {
        type: "string",
        required: true,
        validate: isValidEmail
    }
}, {
    user: {
        pk: {
            field: "pk",
            composite: ["id"],
        },
        sk: {
            field: "sk",
            composite: ["id"],
        },
    }
})