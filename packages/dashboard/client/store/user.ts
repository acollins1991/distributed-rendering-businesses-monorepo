import type { User } from 'lucia'
import { create } from 'zustand'
import { getCookie, setCookie } from "typescript-cookie"
import apiClient from "../utils/apiClient"

interface UserStore {
    user: User | null,
    isAuthenticated: boolean,
    isLoading: boolean,
    authenticateFromCookie: () => Promise<void>,
    signinUser: (details: {
        email: string,
        password: string
    }) => Promise<{
        token: string
    } | null>
}

const tokenCookieName = 'friendly_sites_auth_cookie'

function setTokenCookie(token: string) {
    setCookie(tokenCookieName, token)
}

function getTokenCookie() {
    return getCookie(tokenCookieName)
}

const useUserStore = create<UserStore>((set) => ({
    user: null,
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

        const { user, authenticated } = apiClient.api.authenticate.$post({
            token
        });

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

        // const res = apiClient.signin.$post({ body: details });
        const res = await fetch('/api/signing', {
            method: "POST",
            body: JSON.stringify(details)
        })

        if (res.status !== 200 || !res.token) {
            return null
        }

        setTokenCookie(res.token)

        return {
            token: res.token
        }

    }
}))

export {
    useUserStore
}