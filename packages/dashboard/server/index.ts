import { hc } from 'hono/client'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import sites from './routes/sites'
// import teams from './routes/teams'
import signup from './routes/signup'
import signin from './routes/signin'
import signout from './routes/signout'
import resetpassword from './routes/resetpassword'
import user from './routes/user'

// @ts-ignore index file exists
import html from "../index.html" with { type: "text" };

const app = new Hono()

app.use("*", cors())

app.get('/', async () => {
    return new Response(html, {
        headers: {
            "Content-Type": "text/html"
        }
    })
})

const apiServer = new Hono()
apiServer.route("/user", user)
// sites
apiServer.route("/sites", sites)
// app.route("/teams", teams) teams to be implemented later
apiServer.route("/signup", signup)
apiServer.route('/signin', signin)
apiServer.route("/signout", signout)
apiServer.route("/passwordreset", resetpassword)

app.route('/api', apiServer)

export {
    app
}