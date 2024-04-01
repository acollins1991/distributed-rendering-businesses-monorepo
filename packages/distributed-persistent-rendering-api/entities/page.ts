import createNewEntity from "../../friendly-sites-api/entities/createNewEntity"

export default createNewEntity(
    'page',
    'pages',
    {
        siteId: {
            type: "string",
            required: true
        },
        template: {
            type: "string",
            required: true
        },
    },
    {
        page: {
            pk: {
                field: "pk",
                composite: ["site"],
            },
            sk: {
                field: "sk",
                composite: ["project", "employee"],
            },
        }
    }
)