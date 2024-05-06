import IndexPage from "./dashboard/pages/index"
import { renderToReadableStream } from "react-dom/server";

const res = await fetch('http://localstack:4566/_localstack/health')

// console.log(await res.json());

const server = Bun.serve({
    port: 9385,
    async fetch(request) {
        return new Response(
            renderToReadableStream(<IndexPage />)
        );
    },
})

console.log(`Listening on ${server.url}`);
