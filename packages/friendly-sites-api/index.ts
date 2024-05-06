import { hc } from 'hono/client'
import { Hono } from 'hono'
import { handle } from 'hono/aws-lambda'
import type { ApiContext } from './types'
import sites from './routes/sites'
// import teams from './routes/teams'
import signup from './routes/signup'
import signin from './routes/signin'
import signout from './routes/signout'
import resetpassword from './routes/resetpassword'

const app = new Hono<ApiContext>()

// sites
app.route("/sites", sites)
// app.route("/teams", teams) teams to be implemented later
app.route("/signup", signup)
app.route('/signin', signin)
app.route("/signout", signout)
app.route("/passwordreset", resetpassword)

type AppType = typeof app
const client = hc<AppType>('http://localhost:8787/')
export {
    app
}

export const handler = handle(app)