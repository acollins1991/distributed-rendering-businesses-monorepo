import createNewEntity from "./createNewEntity";

export const entity = createNewEntity('user', 'users', {
    first_name: {
        type: "string",
        required: true
    },
    last_name: {
        type: "string",
        required: true
    },
    accounts: {
        type: "list",
        items: {
            type: "string"
        },
        required: true
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