import { join } from "path"
import { rm } from "node:fs/promises"
import { buildClient } from "./utils/buildClient"
import { buildServer } from "./utils/buildServer"
import { zip } from 'zip-a-folder';

const clientDistDir = join(__dirname, '../../dist/dashboard/client')
const serverDistDir = join(__dirname, '../../dist/dashboard/server')

// clean the folders
await Promise.all([clientDistDir, serverDistDir].map((path) => {
    return rm(path, {
        recursive: true,
        force: true
    })
}))

await Promise.all([
    buildClient(clientDistDir),
    buildServer(serverDistDir)
])

// zip folders
await zip(join(__dirname, '../../dist/dashboard'), '../../dist/dashboard.zip')

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
