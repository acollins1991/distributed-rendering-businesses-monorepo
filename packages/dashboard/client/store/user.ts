import type { User } from 'lucia'
import { create } from 'zustand'
import { combine } from 'zustand/middleware'
import apiClient from "../utils/apiClient"
import authenticatedApiClient from "../utils/authenticatedApiClient"
import { getTokenCookie, removeTokenCookie, setTokenCookie } from '../utils/tokenCookie'

interface UserStore {
    user: User | null,
    token: string | null,
    isAuthenticated: boolean,
    isLoading: boolean,
    authenticateFromCookie: () => Promise<void>,
    signinUser: (details: {
        email: string,
        password: string
    }) => Promise<{
        token: string
    } | null>,
    signupUser: (details: {
        first_name: string,
        last_name: string,
        email: string,
        password: string
    }) => Promise<{
        token: string
    } | null>,
    signoutUser: () => Promise<void>,
    refreshUser: () => Promise<void>
}

const useUserStore = create<UserStore>((set) => ({
    user: null,
    token: getTokenCookie() || null,
    isAuthenticated: false,
    isLoading: true,
    authenticateFromCookie: async () => {

        const token = getTokenCookie()

        if (!token) {
            return
        }

        set((state) => {
            state.isLoading = true
            return state
        })

        const res = await apiClient.authenticate.$post(null, {
            headers: {
                authorization: `Bearer ${getTokenCookie()}`
            }
        });

        if (!res.ok) {
            return
        }

        const { user, authenticated } = await res.json()

        set((state) => {
            if (authenticated) {
                state.user = user
            } else {
                removeTokenCookie()
                state.user = null
            }
            state.isAuthenticated = authenticated
            state.isLoading = false
            return state
        })
    },
    signinUser: async details => {

        const res = await apiClient.signin.$post({
            json: details
        });

        if (!res.ok) {
            return null
        }

        const { token } = await res.json()

        setTokenCookie(token)

        set((state) => {
            return state
        })

        return {
            token: token
        }

    },
    signupUser: async details => {

        const res = await apiClient.signup.$post({
            json: details
        });

        if (res.status !== 200) {
            return null
        }

        const { token } = await res.json()

        if (!token) {
            return null
        }


        setTokenCookie(token)

        return {
            token
        }

    },
    signoutUser: async () => {
        await apiClient.signout.$post();
        removeTokenCookie()
        set((state) => {
            state.user = null
            return state
        })
    },
    async refreshUser() {
        if (!Boolean(getTokenCookie())) {
            console.warn('Cannot use refreshUser without token cookie')
            return
        }

        const res = await authenticatedApiClient.user.$get()
        const user = await res.json()

        set((state) => {
            state.user = user
            return state
        })
    },
    async addNewSite(args: {
        name: string,
        domain?: string
    }) {
        const res = await authenticatedApiClient.sites.$post({
            json: args
        })

        if (res.status !== 200) {
            return
        }

        const json = await res.json()

        const { refreshUser } = useUserStore()

        // update user
        await refreshUser()

        return json
    }
}))

export {
    useUserStore
}