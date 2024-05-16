import { defineStore } from 'pinia'

export const useUserStore = defineStore('counter', () => {

    const user = ref<NonNullable<Awaited<ReturnType<typeof validateTokenAndGetUser>>>["user"]>()

    async function refreshUser() {
        const token = localStorage.getItem("friendly_sites_token");
        if (!token) {
            console.error('Missing token')
        }

        $fetch('/api/user', {
            headers: {
                authorization: `Bearer ${token}`
            }
        })
            .then(res => user.value = res)
            .catch(e => console.error(e))
    }

    return {
        user,
        refreshUser
    }
})