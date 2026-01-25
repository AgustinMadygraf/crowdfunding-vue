/*
Path: src/main.ts
*/

import './assets/main.scss'
import './assets/components.css' // Componentes reutilizables

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { authService } from '@/infrastructure/services/authServiceFactory'
import { AUTH_SERVICE_KEY } from '@/application/useAuthService'
import { getAppConfig } from '@/config/appConfig'
import { setContributionsRepository } from '@/application/ports/contributionsRepositoryProvider'
import { contributionsRepository } from '@/infrastructure/repositories/ContributionsRepository'

// Load API diagnostic utility in development
if (import.meta.env.DEV) {
  import('@/utils/apiDiagnostic').catch(err => {
    console.warn('[main] Failed to load API diagnostic utility:', err)
  })
}

// ============================================================
// DIAGNÓSTICO DE CONFIGURACIÓN - Crítico para debugging
// ============================================================
const appConfig = getAppConfig()
const diagnosticInfo = {
  environment: import.meta.env.MODE,
  prod: import.meta.env.PROD,
  dev: import.meta.env.DEV,
  apiBaseUrl: appConfig.apiBaseUrl,
  siteUrl: appConfig.siteUrl,
  timestamp: new Date().toISOString(),
  userAgent: navigator.userAgent
}

console.info('VITE_DEBUG_HTTP:', import.meta.env.VITE_DEBUG_HTTP === 'true')
console.group('🚀 CROWDFUNDING FRONTEND - Diagnostic Info')
console.info('Environment:', diagnosticInfo.environment)
console.info('Mode:', diagnosticInfo.prod ? 'PRODUCTION' : 'DEVELOPMENT')
console.info('API Base URL:', diagnosticInfo.apiBaseUrl)
console.info('Site URL:', diagnosticInfo.siteUrl)
console.info('Loaded at:', diagnosticInfo.timestamp)
console.groupEnd()

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
    console.info('UTM parameters captured:', utmParams)
  }
}

// Ejecutar captura antes de montar la app
captureUTMParameters()

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.provide(AUTH_SERVICE_KEY, authService)
setContributionsRepository(contributionsRepository)

// Captura global de errores no manejados
type GlobalError = ErrorEvent | PromiseRejectionEvent | Event

window.addEventListener('error', (event: GlobalError) => {
  console.error('Global error', event)
})
window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  console.error('Unhandled promise rejection', event.reason)
})

app.mount('#app')
