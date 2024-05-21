import { join } from "path"

async function buildServer(clientAssetsPath: string) {
    const build = await Bun.build({
        target: 'bun',
        entrypoints: [join(__dirname, '../server/index.tsx')],
        outdir: clientAssetsPath,
        splitting: true,
        minify: true,
        sourcemap: "none"
    })
    return build
}

export {
    buildServer
}