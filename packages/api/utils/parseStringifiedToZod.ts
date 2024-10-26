import { z, type ZodType } from "zod";

export function parseStringifiedToZod( zodSchema: ZodType ) {
    return z.string().transform(value => JSON.parse(value)).pipe(zodSchema)
} 