import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles' 
import { createVuetify } from 'vuetify'
import DateFnsAdapter from '@date-io/date-fns'
import { fr as frLocale } from 'date-fns/locale'
import { fr } from 'vuetify/locale'

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    ssr: true,
    locale: {
      locale: 'fr',
      fallback: 'en',
      messages: { fr },
    },

    date: {
      adapter: DateFnsAdapter,
      formats: {
      },
      locale: {
        fr: frLocale
      }
    },
    theme: {
      defaultTheme: 'light',
      themes: {
        light: {
          dark: false,
          colors: {
            vertClair: '#cce6bb',
            vertFonce: '#445d44',
            gris: '#8591a3', 
            orange: '#ce8536',
            fond: '#ECEFEC',
            SlightlyDark: '#3C3C3C',
            blanc: '#fff',
          },
        },
        dark: {
          dark: true,
          colors: {
            vertClair: '#cce6bb',
            vertFonce: '#445d44',
            gris: '#8591a3', 
            orange: '#ce8536', 
            fond: '#ECEFEC',
            SlightlyDark: '#3C3C3C',
            blanc: "#222",
          },
        },
      },
    },
  })

  nuxtApp.vueApp.use(vuetify)
})