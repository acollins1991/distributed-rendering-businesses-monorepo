import { app } from "./honoApp";
import { handle } from 'hono/aws-lambda'

export const handler = handle(app)