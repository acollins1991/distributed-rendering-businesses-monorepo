import { app } from "./honoApp";
import { handle } from 'hono/lambda-edge'

export const handler = handle(app)