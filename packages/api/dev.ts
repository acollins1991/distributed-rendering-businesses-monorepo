import type { Serve } from "bun";
import { ensureTableExists } from "./utils/ensureResourcesExist";
import { handler } from "./handler";
import type { LambdaEvent } from "hono/aws-lambda";

await ensureTableExists()

// Define a complete LambdaEvent structure for API Gateway Proxy v1
// interface LambdaEvent {
//     httpMethod: string;
//     path: string;
//     body: string | null;
//     isBase64Encoded: boolean;
//     requestContext: {};
//     // CRITICAL for Hono parsing
//     headers: Record<string, string>; 
//     // CRITICAL for query parameters (e.g., /users?id=1)
//     queryStringParameters: Record<string, string> | null; 
// }

async function transformRequestToLambdaEvet(req: Request): Promise<LambdaEvent> {
    const method = req.method.toUpperCase();
    const url = new URL(req.url);
    const headers: Record<string, string> = {};
    let bodyString: string | null = null;
    
    // --- 1. Clone and Get Body (The previous fix) ---
    const reqClone = req.clone(); 
    const bodyMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

    if (bodyMethods.includes(method)) {
        try {
            // Read the raw body string
            const rawBody = await reqClone.text(); 
            if (rawBody.length > 0) {
                bodyString = rawBody;
            }
        } catch (e) {
            console.error('Error reading request body as text:', e);
        }
    }

    // --- 2. Get Headers (The previous fix) ---
    // Hono/Lambda adapters often expect lowercase headers
    req.headers.forEach((value, key) => {
        headers[key.toLowerCase()] = value;
    });

    // Fallback: Ensure Content-Type is set if body is present
    if (bodyString && !headers['content-type']) {
        headers['content-type'] = 'application/json'; 
    }

    // --- 3. Get Query Parameters (The missing piece for full requests) ---
    const queryStringParameters: Record<string, string> = {};
    for (const [key, value] of url.searchParams.entries()) {
        queryStringParameters[key] = value;
    }
    
    const hasQueryParams = Object.keys(queryStringParameters).length > 0;

    // The API Gateway path stripping specific to your Bun setup
    const apiPath = url.pathname.split('/api')[1] || '/';

    const event: LambdaEvent = {
        httpMethod: method,
        path: apiPath,
        body: bodyString, 
        isBase64Encoded: false,
        requestContext: {},
        headers: headers,
        // Pass null if no query parameters exist, as per API Gateway spec
        queryStringParameters: hasQueryParams ? queryStringParameters : null, 
    }
    return event;
}

async function resHandler(req: Request) {
    const lambdaEventObject = await transformRequestToLambdaEvet(req)
    const handlerRes = await handler(lambdaEventObject)
    const res = new Response(handlerRes.body, {
        ...handlerRes,
        status: handlerRes.statusCode
    })

    // return res

    res.headers.set('Access-Control-Allow-Origin', "http://localhost:8080");
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.headers.set('Access-Control-Allow-Credentials', 'true');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return res
}

const serverOptions: Serve<unknown> = {
    port: 3000,
    fetch: resHandler
}

const server = Bun.serve(serverOptions)

console.log(`Server running at http://${server.hostname}:${server.port}`)

process.on("exit", () => {
    server.stop()
    console.log('server stopped')
})

