/**
 * Composable para inicializar y gestionar CSRF token
 */

import { onMounted } from 'vue'
import { getCsrfService } from '@/application/ports/csrfProvider'
import { getAppConfig } from '@/config/appConfig'
import { getLogger } from '@/application/ports/loggerProvider'
import { getBackendOfflineReason, isBackendTemporarilyOffline } from '@/utils/backendAvailability'
import { isNetworkUnavailableError } from '@/utils/networkDiagnostics'

const csrfService = getCsrfService()
const logger = getLogger()
let lastCsrfOfflineWarningAt = 0

/**
 * Composable para cargar y gestionar el token CSRF
 * Debe llamarse en el componente raiz (App.vue) para asegurar disponibilidad global
 */
export function useCsrfToken() {
  /**
   * Solicita el token CSRF del backend
   * Intenta primero el endpoint dedicado, luego fallback a contributions
   */
  const fetchCsrfTokenFromBackend = async (): Promise<void> => {
    const appConfig = getAppConfig()
    const apiBaseUrl = appConfig.apiBaseUrl

    if (import.meta.env.DEV && !appConfig.devBackendRequired) {
      return
    }

    if (import.meta.env.DEV && isBackendTemporarilyOffline()) {
      const now = Date.now()
      if (now - lastCsrfOfflineWarningAt > 10000) {
        lastCsrfOfflineWarningAt = now
        logger.warn(
          `[useCsrfToken] Backend offline detectado (${getBackendOfflineReason() || 'network'}). Se omite init CSRF temporalmente.`
        )
      }
      return
    }

    // Estrategia 1: Endpoint dedicado /api/csrf-token (RECOMENDADO)
    try {
      const response = await fetch(`${apiBaseUrl}/api/csrf-token`, {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json' }
      })

      if (response.ok) {
        const csrfTokenHeader = response.headers.get('X-CSRF-Token')
        if (csrfTokenHeader) {
          csrfService.setToken(csrfTokenHeader)
          return
        }

        const token = csrfService.readFromCookie('XSRF-TOKEN')
        if (token) {
          csrfService.setToken(token)
          return
        }
      }
    } catch (error) {
      if (isNetworkUnavailableError(error)) {
        const now = Date.now()
        if (now - lastCsrfOfflineWarningAt > 10000) {
          lastCsrfOfflineWarningAt = now
          logger.warn(
            '[useCsrfToken] Backend no disponible. Se omite fallback CSRF para evitar ruido de consola.'
          )
        }
        return
      }
    }

    // Estrategia 2: Fallback - Usar endpoint existente GET /api/contributions
    try {
      const response = await fetch(`${apiBaseUrl}/api/contributions?_csrf_init=1`, {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json' }
      })

      if (response.ok) {
        const csrfTokenHeader = response.headers.get('X-CSRF-Token')
        if (csrfTokenHeader) {
          csrfService.setToken(csrfTokenHeader)
          return
        }

        const token = csrfService.readFromCookie('XSRF-TOKEN')
        if (token) {
          csrfService.setToken(token)
          return
        }
      }

      if (import.meta.env.DEV) {
        logger.warn('[useCsrfToken] Backend no respondio con token CSRF')
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        logger.error('[useCsrfToken] Error al solicitar token CSRF:', error)
      }
    }
  }

  /**
   * Inicializa el token CSRF
   * 1. Meta tag
   * 2. Cookie XSRF-TOKEN
   * 3. Request al backend
   */
  const initializeCsrfToken = async (): Promise<void> => {
    let token = csrfService.readFromHeader('X-CSRF-Token')

    if (!token) {
      token = csrfService.readFromCookie('XSRF-TOKEN')
    }

    if (token) {
      csrfService.setToken(token)
    } else {
      await fetchCsrfTokenFromBackend()
    }
  }

  onMounted(() => {
    initializeCsrfToken()
  })

  async function getCsrfToken() {
    try {
      let token = csrfService.readFromHeader('X-CSRF-Token')

      if (!token) {
        token = csrfService.readFromCookie('XSRF-TOKEN')
      }

      if (token) {
        csrfService.setToken(token)
      } else {
        await fetchCsrfTokenFromBackend()
      }
    } catch (error) {
      logger.error('Error obteniendo CSRF token (composable)', error)
      throw error
    }
  }

  return {
    initializeCsrfToken,
    getToken: () => csrfService.getToken(),
    getCsrfToken
  }
}
