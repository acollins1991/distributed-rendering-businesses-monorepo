<template>
    <div class="w-full max-w-xs">
        <form class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" @submit.prevent="login">
            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="email">
                    Email
                </label>
                <input
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    name="email" type="email" placeholder="Email" required>
            </div>
            <div class="mb-6">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
                    Password
                </label>
                <input
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                    name="password" type="password" placeholder="******************" required>
            </div>
            <div class="flex items-center justify-between">
                <button
                    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    type="submit">
                    Sign In
                </button>
                <a class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" href="#">
                    Forgot Password?
                </a>
            </div>
        </form>

        <NuxtLink
            class="inline-block w-full align-baseline font-bold text-sm text-blue-500 hover:text-blue-800 text-center mb-4"
            to="/signup">
            Create an account
        </NuxtLink>

        <p class="text-center text-gray-500 text-xs">
            &copy;2020 Acme Corp. All rights reserved.
        </p>
    </div>
</template>

<script setup lang="ts">
async function signin(event: Event) {
    const form = event.target as HTMLFormElement
    const formData = new FormData(form)
    const submissionObject = {}

    formData.entries().forEach(([key, value]) => {
        submissionObject[key] = value
    })

    const res = await $fetch('/api/signin', {
        method: "POST",
        body: submissionObject
    })

    document.cookie = `friendly_sites_token=${res.token}`
}
</script>