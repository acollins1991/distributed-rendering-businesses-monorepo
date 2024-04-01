import createNewEntity from "./createNewEntity";

export const entity = createNewEntity('site', 'sites', {
    accountId: {
        type: 'string',
        required: true
    },
    domain: {
        type: 'string',
        required: true
    }
}, {
    byAccount: {
        pk: {
            field: "pk",
            composite: ["accountId"],
        },
        sk: {
            field: "sk",
            composite: ["id"],
        },
    }
})