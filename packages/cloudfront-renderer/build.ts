import { join } from "path"

await Bun.build({
    entrypoints: [join(__dirname, './index.ts')],
    outdir: './dist',
    target: "node",
    minify: true
})