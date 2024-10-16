import type { AppType } from '../../../api/honoApp'
import { hc } from 'hono/client'

export const client = hc<AppType>('http://localhost:3000/', {
    fetch: (req: Request, init?: RequestInit) => {
        return fetch(req, {
            ...init,
            credentials: 'include'
        })
    }
})