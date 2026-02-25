/*
Path: src/main.ts
*/

import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { authService } from '@/infrastructure/services/authServiceFactory'
import { AUTH_SERVICE_KEY } from '@/presentation/composables/useAuthService'
import { setAuthService } from '@/presentation/providers/authServiceProvider'
import { getAppConfig } from '@/config/appConfig'
import { setContributionsRepository } from '@/application/ports/contributionsRepositoryProvider'
import { contributionsRepository } from '@/infrastructure/repositories/ContributionsRepository'
import { logger } from '@/infrastructure/logging/logger'
import { initChatwoot } from '@/infrastructure/services/chatwootBootstrap'

if (import.meta.env.DEV) {
  import('@/utils/apiDiagnostic').catch((err) => {
    logger.warn('[main] Failed to load API diagnostic utility:', err)
  })
}

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

if (import.meta.env.DEV) {
  logger.info('VITE_DEBUG_HTTP:', import.meta.env.VITE_DEBUG_HTTP === 'true')
  logger.info('CROWDFUNDING FRONTEND - Diagnostic Info', diagnosticInfo)
}

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

  if (Object.keys(utmParams).length > 0) {
    sessionStorage.setItem('utm_params', JSON.stringify(utmParams))
    sessionStorage.setItem('utm_captured_at', new Date().toISOString())
    logger.info('UTM parameters captured')
  }
}

captureUTMParameters()
initChatwoot()
setAuthService(authService)

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.provide(AUTH_SERVICE_KEY, authService)
setContributionsRepository(contributionsRepository)

type GlobalError = ErrorEvent | PromiseRejectionEvent | Event

window.addEventListener('error', (_event: GlobalError) => {
  logger.event('error', {
    code: 'APP_GLOBAL_ERROR',
    context: 'Global error event capturado'
  })
})
window.addEventListener('unhandledrejection', (_event: PromiseRejectionEvent) => {
  logger.event('error', {
    code: 'APP_UNHANDLED_REJECTION',
    context: 'Unhandled promise rejection capturado'
  })
})

app.mount('#app')
