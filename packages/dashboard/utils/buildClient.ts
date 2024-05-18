import { join } from "path"

async function buildClient(clientAssetsPath: string) {
    return Bun.build({
        target: 'browser',
        entrypoints: [join(__dirname, '../client/index.tsx')],
        outdir: clientAssetsPath,
        splitting: true,
        minify: true,
    })
}

export {
    buildClient
}