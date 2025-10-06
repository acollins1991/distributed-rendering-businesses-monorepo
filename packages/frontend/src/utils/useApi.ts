import type { AppType } from '../../../api/honoApp'
import { hc } from 'hono/client'

export const client = hc<AppType>('http://localhost:3000/', {
    fetch: (url: string, req: Request) => {
        const authToken = localStorage.getItem('friendly_sites_token')
        if (authToken) {
            req.headers.set('Authorization', `Bearer ${authToken}`)
        }
        return fetch(url, {
            ...req,
            credentials: 'include'
        })
    }
})