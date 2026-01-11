import './assets/main.css'
import './assets/components.css' // Componentes reutilizables

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { authService } from '@/infrastructure/services/authServiceFactory'
import { AUTH_SERVICE_KEY } from '@/application/useAuthService'

// Captura UTM parameters en la carga inicial (NFR-MKT-001)
const captureUTMParameters = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const utmParams: Record<string, string> = {}

  const utmKeys = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'campaign_id',
    'referrer'
  ]

  utmKeys.forEach((key) => {
    const value = urlParams.get(key)
    if (value) {
      utmParams[key] = value
    }
  })

  // Guardar en sessionStorage si hay parámetros UTM
  if (Object.keys(utmParams).length > 0) {
    sessionStorage.setItem('utm_params', JSON.stringify(utmParams))
    sessionStorage.setItem('utm_captured_at', new Date().toISOString())
    console.log('UTM parameters captured:', utmParams)
  }
}

// Ejecutar captura antes de montar la app
captureUTMParameters()

const app = createApp(App)

app.use(router)
app.provide(AUTH_SERVICE_KEY, authService)
app.mount('#app')
