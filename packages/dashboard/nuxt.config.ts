console.log('I AM STARTING')

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
  tailwindcss: {
    exposeConfig: true,
    viewer: true,
  },
  pinia: {
    storesDirs: ['./stores/**'],
  },
})
