import { join } from "path"

const isDev = process.env.MODE === 'development'

async function buildClient(clientAssetsPath: string) {
    const build = await Bun.build({
        target: 'browser',
        entrypoints: [join(__dirname, '../client/entry-client.tsx')],
        outdir: clientAssetsPath,
        splitting: true,
        minify: isDev ? false : true,
        sourcemap: isDev ? "inline" : "none",
        naming: "[dir]/client.[ext]"
    })
    return build
}

export {
    buildClient
}