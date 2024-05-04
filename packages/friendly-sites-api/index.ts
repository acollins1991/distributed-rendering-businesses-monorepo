import { hc } from 'hono/client'
import { Hono } from 'hono'
import { handle } from 'hono/aws-lambda'
import type { LambdaBindings } from './types'
import sites from './routes/sites'
import teams from './routes/teams'
import signup from './routes/signup'

const app = new Hono<{ Bindings: LambdaBindings }>()

// sites
app.route("/sites", sites)
app.route("/teams", teams)
app.route("/signup", signup)

type AppType = typeof app
const client = hc<AppType>('http://localhost:8787/')
export {
    app
}

export const handler = handle(app)