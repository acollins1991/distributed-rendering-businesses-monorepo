import createNewEntity from "./createNewEntity";

export const entity = createNewEntity('account', 'accounts', {
    sites: {
        type: "list",
        items: {
            type: "string"
        },
        required: true
    }
}, {
    account: {
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