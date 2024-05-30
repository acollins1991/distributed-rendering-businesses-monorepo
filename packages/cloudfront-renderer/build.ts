import { join } from "path"

await Bun.build({
    entrypoints: [join(__dirname, './index.ts')],
    outdir: '../../dist/handler',
    target: "node",
    naming: "[dir]/[name].mjs",
    minify: {
        whitespace: true,
        syntax: true,
        identifiers: false
    },
    splitting: false
})