import type { LambdaEvent, LambdaContext } from 'hono/aws-lambda'

export type LambdaBindings = {
    // Unfortunately can't use LambdaEvent as it also includes ALBEvent which is not compatible
    event: LambdaEvent,
    context: LambdaContext
}