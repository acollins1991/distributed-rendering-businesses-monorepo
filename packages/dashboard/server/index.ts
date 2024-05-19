import { Hono } from 'hono'
import sites from './routes/sites'
import signup from './routes/signup'
import signin from './routes/signin'
import signout from './routes/signout'
import resetpassword from './routes/resetpassword'
import user from './routes/user'
import { serveStatic } from 'hono/bun'
import { logger } from 'hono/logger'

// @ts-ignore index file exists
import html from "../index.html" with { type: "text" };
import authenticate from './routes/authenticate'

const app = new Hono()

app.get('/', async () => {
    return new Response(html, {
        headers: {
            "Content-Type": "text/html"
        }
    })
})
// route notFound to index so react can handle
app.notFound((c) => {
    if (c.req.url.includes('/api/')) {
        return c.text("API route not found", 404)
    }

    return new Response(html, {
        headers: {
            "Content-Type": "text/html"
        }
    })
})
// serve static files
app.get('/dist/client/*', serveStatic({
    root: '.',
    onNotFound(path, c) {
        console.log(path)
    }
}))

const apiServer = new Hono()
apiServer.use(logger())
apiServer.route("/user", user)
// sites
apiServer.route("/sites", sites)
// app.route("/teams", teams) teams to be implemented later
apiServer.route("/signup", signup)
apiServer.route('/signin', signin)
apiServer.route("/signout", signout)
apiServer.route("/passwordreset", resetpassword)
apiServer.route("/authenticate", authenticate)

app.route('/api', apiServer)

export type AppType = typeof app

export {
    app
}