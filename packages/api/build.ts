import { join } from "path"

const build = await Bun.build({
    target: 'bun',
    entrypoints: [join(__dirname, './handler')],
    outdir: join(__dirname, '../../dist/api'),
    splitting: true,
    minify: true,
    sourcemap: "none"
})

console.log(build.outputs)