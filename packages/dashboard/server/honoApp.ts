import { Hono } from 'hono'
import sites from './routes/sites'
import signup from './routes/signup'
import signin from './routes/signin'
import signout from './routes/signout'
import resetpassword from './routes/resetpassword'
import user from './routes/user'
import templates from './routes/templates'
import components from './routes/components'
import { logger } from 'hono/logger'
import { cors } from "hono/cors"

import authenticate from './routes/authenticate'

// required for rpc client
const app = new Hono()
    .basePath('/api')
    .use(cors({
        origin: ["http://localhost:8080/"],
        credentials: true
    }))
    .route("/user", user)
    .route("/sites",
        sites
            .route('/:siteId/templates', templates)
            .route('/:siteId/components', components)
    )
    .route("/signup", signup)
    .route('/signin', signin)
    .route("/signout", signout)
    .route("/passwordreset", resetpassword)
    .route("/authenticate", authenticate)

if( process.env.NODE_ENV === 'test' ) {
    app.use(logger())
}
app.use(logger())

export type AppType = typeof app

export {
    app
}