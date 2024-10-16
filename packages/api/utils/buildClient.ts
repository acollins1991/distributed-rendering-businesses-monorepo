import { join } from "path"
import type { BunPlugin } from "bun";
import postcss from "postcss";
import tailwind from "tailwindcss"
import fs from "node:fs"
import path from "node:path"
import postcssMinify from "@csstools/postcss-minify"
import { SolidPlugin } from "bun-plugin-solid";

const isDev = process.env.MODE === 'development'

const tailwindPlugin = tailwind({
    jit: true,
    content: ['./**/*.{html,js,ts,tsx}'],
    // content: ['./src/*.{html,js,ts,tsx}'],
})
const postcssMinifyPlugin = postcssMinify()

const myPlugin: BunPlugin = {
    name: "PostCSS Loader",
    setup(build) {
        build.onLoad({ filter: /\.css$/ }, async (args) => {

            if (!build.config.outdir) {
                throw Error('missing outdir')
            }

            const css = await Bun.file(args.path).text();
            // console.log(path.join(__dirname, "../**/*.{html,js,ts,tsx}"));
            const compiledCss = await postcss([tailwindPlugin, postcssMinifyPlugin]).process(css, { from: args.path, to: build.config.outdir }).then(res => res)

            const cssLocation = path.join(build.config.outdir, `app.css`)

            if (!fs.existsSync(build.config.outdir)) {
                fs.mkdirSync(build.config.outdir, { recursive: true })
            }
            fs.writeFileSync(cssLocation, compiledCss.css)

            return {
                contents: '',
                loader: 'js'
            };
        })
    },
};


async function buildClient(clientAssetsPath: string) {

    if (!fs.existsSync(clientAssetsPath)) {
        fs.mkdirSync(clientAssetsPath, { recursive: true })
    }

    const build = await Bun.build({
        target: 'browser',
        entrypoints: [join(__dirname, '../client/entry-client.tsx')],
        outdir: clientAssetsPath,
        splitting: true,
        // minify: isDev ? false : true,
        minify: true,
        sourcemap: isDev ? "inline" : "none",
        naming: "[dir]/client.[ext]",
        plugins: [myPlugin, SolidPlugin()]
    })
    return build
}

export {
    buildClient
}