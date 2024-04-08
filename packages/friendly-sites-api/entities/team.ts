import createNewEntity from "./createNewEntity";

export const entity = createNewEntity('account', 'accounts', {
    name: {
        type: 'string',
        required: true
    },
    users: {
        type: 'list',
        items: {
            type: 'string',
            required: true,
        },
        validate: (value: Array<string>) => value.length > 0 ? '' : 'Teams require at least one user'
    }
}, {
    team: {
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