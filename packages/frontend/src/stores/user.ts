import { create } from 'zustand'
import type { User } from "lucia";
import { client } from '../utils/useApi';
import Cookies from 'js-cookie'
import { tokenCookieName } from '../../../dashboard/server/utils/authCookieName';

type UserStore = {
    user: User | null,
    isAuthenticated: boolean,
    isLoading: boolean,
    setUser: (token: string) => void,
    setIsLoading: (value: boolean) => void,
    token: string | null
}

export const useUserStore = create<UserStore>()((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    token: Cookies.get(tokenCookieName) as string || null,
    async setUser() {
        set({ isLoading: true })
        const res = await client.api.user.$get()
        if( res.status === 200 ) {
            set({ user: await res.json() })
        } 
        set({ isLoading: false, isAuthenticated: res.status === 200 })
    },
    setIsLoading(value) {
        set({ isLoading: value })
    }
}))