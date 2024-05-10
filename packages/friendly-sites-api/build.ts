import { join } from "path"

const build = await Bun.build({
    target: 'bun',
    entrypoints: [join(__dirname, './index.ts')],
    outdir: './dist',
    // minify: true,
    external: [
        // "@aws-sdk/client-dynamodb",
        // "@aws-sdk/client-lambda",
        // "@aws-sdk/client-route-53",
        "@aws-sdk/*",
        "@faker-js/faker",
        "@types/aws-lambda",
        "aws-lambda",
        "check-password-strength",
        "date-fns",
        "electrodb",
        "hono",
        "io-ts",
        "lucia",
        "oslo",
        "react",
        "react-dom",
        "ts-runtime",
        "zod"
    ]
})

console.log(build)

