import type { User } from 'lucia'
import { create } from 'zustand'
import apiClient from "../utils/apiClient"
import { getTokenCookie, setTokenCookie } from '../utils/tokenCookie'

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
    } | null>
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

        if (res.status !== 200 || !res.token) {
            return null
        }

        const { token } = await res.json()

        setTokenCookie(token)

        return {
            token: res.token
        }

    }
}))

export {
    useUserStore
}