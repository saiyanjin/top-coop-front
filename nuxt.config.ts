import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  // Active la structure Nuxt 4
  future: {
    compatibilityVersion: 4,
  },

  // C'est ici que l'on déclare proprement les types pour TypeScript
  typescript: {
    tsConfig: {
      compilerOptions: {
        types: ['vuetify']
      }
    }
  },

  build: {
    transpile: ['vuetify'],
  },

  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }))
      })
    },
  ],

  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NEST_API_URL || '',
    }
  }
})