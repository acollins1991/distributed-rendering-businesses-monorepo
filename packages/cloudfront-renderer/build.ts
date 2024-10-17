import { join } from "path"

await Bun.build({
    entrypoints: [join(__dirname, './index.ts')],
    outdir: '../../dist/cloudfront-renderer',
    target: "node",
    naming: "[dir]/[name].js",
    minify: {
        whitespace: true,
        syntax: true,
        identifiers: false
    },
    splitting: true
})