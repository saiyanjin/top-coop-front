import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },

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
      apiBase: process.env.NEST_API_URL || 'http://localhost:3002',
    }
  },

  css: [
    './app/assets/css/style.css'
  ]
})