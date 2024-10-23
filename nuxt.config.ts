import { dirname } from 'path'
import { fileURLToPath } from 'url'

const currentDir = dirname(fileURLToPath(import.meta.url))

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  future: { compatibilityVersion: 4 },
  devtools: { enabled: true },
  typescript: {
    strict: true,
    typeCheck: false
  },
  experimental: {
    crossOriginPrefetch: true
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
    'shadcn-nuxt',
    '@nuxt/icon',
    '@nuxtjs/color-mode',
    'nuxt-lucide-icons',
    '@nuxt/fonts',
    '@pinia/nuxt',
    '@nuxt/test-utils/module'
  ],
  pinia: {
    storesDirs: [`${currentDir}/layers/**/stores`]
  },
  imports: {
    presets: [
      {
        from: 'nanoid',
        imports: ['nanoid']
      }
    ]
  }
})
