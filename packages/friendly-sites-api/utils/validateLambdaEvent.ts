import type { Context, Input, Next, Env, MiddlewareHandler, ValidationTargets, } from "hono";
import { } from "hono/validator"
import type { ZodSchema, z } from "zod";
import type { LambdaBindings } from "../types";

type HasUndefined<T> = undefined extends T ? true : false

type EnvWithLambdaBindings = Env & {
    Bindings: LambdaBindings
}

type LimitedValidationTargets = Pick<ValidationTargets, 'json' | 'query'>

export default function validateLambdaEvent
    <
        Body extends ZodSchema,
        Query extends ZodSchema,
        Target extends keyof LimitedValidationTargets,
        E extends EnvWithLambdaBindings,
        P extends string,
        In = z.input<Body>,
        Out = z.output<Body>,
        I extends Input = {
            in: HasUndefined<In> extends true
            ? {
                [K in Target]?: K extends 'json'
                ? In
                : HasUndefined<keyof LimitedValidationTargets[K]> extends true
                ? { [K2 in keyof In]?: LimitedValidationTargets[K][K2] }
                : { [K2 in keyof In]: LimitedValidationTargets[K][K2] }
            }
            : {
                [K in Target]: K extends 'json'
                ? In
                : HasUndefined<keyof LimitedValidationTargets[K]> extends true
                ? { [K2 in keyof In]?: LimitedValidationTargets[K][K2] }
                : { [K2 in keyof In]: LimitedValidationTargets[K][K2] }
            }
            out: { [K in Target]: Out }
        },
        V extends I = I
    >
    (
        schemas: {
            bodySchema?: Body,
            querySchema?: Query
        },
    ): MiddlewareHandler<E, P, V> {
    const { bodySchema, querySchema } = schemas

    return async (c: Context<E>, next: Next) => {

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