import createNewEntity from "./createNewEntity";

export const entity = createNewEntity('site', 'sites', {
    teamId: {
        type: 'string',
        required: true,
        readOnly: true
    },
    domain: {
        type: 'string',
        default: () => crypto.randomUUID(),
        required: true
    }
}, {
    byAccount: {
        pk: {
            field: "pk",
            composite: ["teamId"],
        },
        sk: {
            field: "sk",
            composite: ["id"],
        },
    }
})