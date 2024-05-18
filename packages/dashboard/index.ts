import { join } from "path"

const clientBuild = await Bun.build({
    target: 'browser',
    entrypoints: [join(__dirname, './client/index.tsx')],
    outdir: join(__dirname, './dist/client'),
    splitting: true,
    minify: true,
    // external: [
    //     // "@aws-sdk/client-dynamodb",
    //     // "@aws-sdk/client-lambda",
    //     // "@aws-sdk/client-route-53",
    //     "@aws-sdk/*",
    //     "@faker-js/faker",
    //     "@types/aws-lambda",
    //     "aws-lambda",
    //     "check-password-strength",
    //     "date-fns",
    //     "electrodb",
    //     "hono",
    //     "io-ts",
    //     "lucia",
    //     "oslo",
    //     "react",
    //     "react-dom",
    //     "ts-runtime",
    //     "zod"
    // ]
})

// const serverBuild = await Bun.build({
//     target: 'bun',
//     entrypoints: [join(__dirname, './server/index.ts')],
//     outdir: join(__dirname, './dist/server'),
//     splitting: true,
//     minify: true,
//     // external: [
//     //     // "@aws-sdk/client-dynamodb",
//     //     // "@aws-sdk/client-lambda",
//     //     // "@aws-sdk/client-route-53",
//     //     "@aws-sdk/*",
//     //     "@faker-js/faker",
//     //     "@types/aws-lambda",
//     //     "aws-lambda",
//     //     "check-password-strength",
//     //     "date-fns",
//     //     "electrodb",
//     //     "hono",
//     //     "io-ts",
//     //     "lucia",
//     //     "oslo",
//     //     "react",
//     //     "react-dom",
//     //     "ts-runtime",
//     //     "zod"
//     // ]
// })
