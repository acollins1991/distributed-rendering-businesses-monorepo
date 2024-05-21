import { join } from "path"

async function buildClient(clientAssetsPath: string) {
    const build = await Bun.build({
        target: 'browser',
        entrypoints: [join(__dirname, '../client/index.tsx')],
        outdir: clientAssetsPath,
        splitting: true,
        minify: true,
        sourcemap: "inline"
    })
    return build
}

export {
    buildClient
}