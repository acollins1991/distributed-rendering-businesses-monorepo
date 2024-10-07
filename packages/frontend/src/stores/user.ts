import { create } from 'zustand'
import type { User } from "lucia";
import { client } from '../utils/useApi';

type UserStore = {
    user: User | null,
    isAuthenticated: boolean,
    isLoading: boolean,
    setUser: (token: string) => Promise<User>
}

export const useUserStore = create<UserStore>()((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    async setUser(token: string) {
        console.log('setting user')
        set({ isLoading: true })
        console.log(document.cookie)
        const res = client.api.user.$get()
        console.log(document.cookie)
        set({ user: res.user })
        set({ isLoading: false, isAuthenticated: true })
    }
}))