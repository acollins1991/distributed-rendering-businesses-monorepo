import { Hono } from 'hono'
import sites from './routes/sites'
import signup from './routes/signup'
import signin from './routes/signin'
import signout from './routes/signout'
import resetpassword from './routes/resetpassword'
import user from './routes/user'
import { logger } from 'hono/logger'

import authenticate from './routes/authenticate'

const isTest = process.env.NODE_ENV === 'test'

const apiServer = new Hono()

if (!isTest) {
    apiServer.use(logger())
}

// required for rpc client
const app = new Hono()
    .route('/api',
        apiServer.route("/user", user)
            .route("/sites", sites)
            .route("/signup", signup)
            .route('/signin', signin)
            .route("/signout", signout)
            .route("/passwordreset", resetpassword)
            .route("/authenticate", authenticate)
    )

export type AppType = typeof app

export {
    app
}