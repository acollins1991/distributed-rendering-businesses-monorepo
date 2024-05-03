import type { Entity, EntityItem } from 'electrodb';
import type { LambdaEvent, LambdaContext } from 'hono/aws-lambda'
import type { z } from 'zod';

export type LambdaBindings = {
    // Unfortunately can't use LambdaEvent as it also includes ALBEvent which is not compatible
    event: LambdaEvent,
    context: LambdaContext
}

export type TypeToZod<T> = {
    [K in keyof T]: T[K] extends (string | number | boolean | null | undefined)
    ? (undefined extends T[K] ? z.ZodOptional<z.ZodType<Exclude<T[K], undefined>>> : z.ZodType<T[K]>)
    : z.ZodObject<TypeToZod<T[K]>>
};

export type EntityToZod<E extends Entity> = TypeToZod<EntityItem<E>>