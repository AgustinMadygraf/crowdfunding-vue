import './assets/main.css'
import './assets/components.css' // Componentes reutilizables

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { authService } from '@/infrastructure/services/authServiceFactory'
import { AUTH_SERVICE_KEY } from '@/application/useAuthService'
import { Logger } from '@/infrastructure/logger'

// Inicializar Sentry solo en producción
if (import.meta.env.PROD) {
  Logger.setupSentry({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: 1.0,
  })
}

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
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.provide(AUTH_SERVICE_KEY, authService)

// Captura global de errores no manejados
type GlobalError = ErrorEvent | PromiseRejectionEvent | Event

window.addEventListener('error', (event: GlobalError) => {
  Logger.error('Global error', event)
})
window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  Logger.error('Unhandled promise rejection', event.reason)
})

app.mount('#app')
