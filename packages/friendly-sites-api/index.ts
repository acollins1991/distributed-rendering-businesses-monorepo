import { Hono } from 'hono'
import type { LambdaEvent, LambdaContext } from 'hono/aws-lambda'
import { handle } from 'hono/aws-lambda'

type Bindings = {
    event: LambdaEvent
    context: LambdaContext
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/aws-lambda-info/', (c) => {
    return c.json({
        isBase64Encoded: c.env.event.isBase64Encoded,
        awsRequestId: c.env.context.awsRequestId
    })
})

export const handler = handle(app)