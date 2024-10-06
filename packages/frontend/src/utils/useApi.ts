import type { AppType } from '../../../dashboard/server/honoApp'
import { hc } from 'hono/client'

export const client = hc<AppType>('http://localhost:3000/')