import type { Context, Next } from "hono";
import type { ZodSchema } from "zod";
import type { LambdaBindings } from "../types";

export default function validateLambdaEvent<Body extends ZodSchema, Query extends ZodSchema>(schemas: {
    bodySchema?: Body,
    querySchema?: Query
}) {
    const { bodySchema, querySchema } = schemas

    return async (c: Context<{ Bindings: LambdaBindings }>, next: Next) => {

        const { body, queryStringParameters } = c.env.event;

        if (bodySchema) {
            const bodySchemaValidation = bodySchema.safeParse(JSON.parse(body as string))
            if (!bodySchemaValidation.success) {
                return c.json(bodySchemaValidation.error, 400)
            }
        }

        if (querySchema) {
            const querySchemaValidation = querySchema.safeParse(queryStringParameters)
            if (!querySchemaValidation.success) {
                return c.json(querySchemaValidation.error, 400)
            }
        }

        await next();
    }
}