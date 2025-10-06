import { create } from 'zustand'
import type { User } from "lucia";
import { client } from '../utils/useApi';

type UserStore = {
    user: User | null,
    isAuthenticated: boolean,
    isLoading: boolean,
    setUser: () => Promise<void>,
    setIsLoading: (value: boolean) => void,
    token: string | null,
    setToken: (token: string) => void,
    signOut: () => Promise<void>
}

export const useUserStore = create<UserStore>()((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    token: localStorage.getItem('friendly_sites_token') as string || null,
    setToken(token: string) {
        localStorage.setItem('friendly_sites_token', token)
        set({ token })
    },
    async setUser() {
        set({ isLoading: true })
        const res = await client.api.user.$get()
        if( res.status === 200 ) {
            set({ user: await res.json() })
        } 
        if( res.status === 403 ) {
            set( { token: null } )
        }
        set({ isLoading: false, isAuthenticated: res.status === 200 })
    },
    setIsLoading(value) {
        set({ isLoading: value })
    },
    async signOut() {
        set({ isLoading: true })
        await client.api.signout.$post()
        localStorage.removeItem('friendly_sites_token')
        set({ isLoading: false, isAuthenticated: false, token: null, user: null })
    }
}))