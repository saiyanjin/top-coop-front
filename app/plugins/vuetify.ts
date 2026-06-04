import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles' 
import { createVuetify } from 'vuetify'

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    ssr: true,
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
          },
        },
      },
    },
  })

  nuxtApp.vueApp.use(vuetify)
})