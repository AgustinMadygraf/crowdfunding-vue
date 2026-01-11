/**
 * Composable para inicializar y gestionar CSRF token
 */

import { onMounted } from 'vue'
import { csrfService } from '@/infrastructure/services/csrfService'
import { getApiBaseUrl } from '@/config/api'

/**
 * Composable para cargar y gestionar el token CSRF
 * Debe llamarse en el componente raíz (App.vue) para asegurar disponibilidad global
 */
export function useCsrfToken() {
  /**
   * Solicita el token CSRF del backend
   * Intenta primero el endpoint dedicado, luego fallback a contributions
   */
  const fetchCsrfTokenFromBackend = async (): Promise<void> => {
    const apiBaseUrl = getApiBaseUrl()
    
    // Estrategia 1: Endpoint dedicado /api/csrf-token (RECOMENDADO)
    // Si backend implementa este endpoint, es la forma más eficiente
    try {
      if (import.meta.env.DEV) {
        console.log('[useCsrfToken] 🔄 Intentando endpoint dedicado /api/csrf-token...')
      }
      
      const response = await fetch(`${apiBaseUrl}/api/csrf-token`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      })
      
      if (response.ok) {
        const csrfTokenHeader = response.headers.get('X-CSRF-Token')
        if (csrfTokenHeader) {
          csrfService.setToken(csrfTokenHeader)
          if (import.meta.env.DEV) {
            console.log('[useCsrfToken] ✅ Token CSRF obtenido (endpoint dedicado)')
          }
          return
        }
        
        const token = csrfService.readFromCookie('XSRF-TOKEN')
        if (token) {
          csrfService.setToken(token)
          if (import.meta.env.DEV) {
            console.log('[useCsrfToken] ✅ Token CSRF obtenido (endpoint dedicado)')
          }
          return
        }
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.log('[useCsrfToken] ℹ️ Endpoint dedicado no disponible, usando fallback...')
      }
    }
    
    // Estrategia 2: Fallback - Usar endpoint existente GET /api/contributions
    // Esta estrategia funciona pero carga datos innecesarios
    try {
      if (import.meta.env.DEV) {
        console.log('[useCsrfToken] 🔄 Usando fallback /api/contributions...')
      }
      
      const response = await fetch(`${apiBaseUrl}/api/contributions?_csrf_init=1`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      })
      
      if (response.ok) {
        const csrfTokenHeader = response.headers.get('X-CSRF-Token')
        if (csrfTokenHeader) {
          csrfService.setToken(csrfTokenHeader)
          if (import.meta.env.DEV) {
            console.log('[useCsrfToken] ✅ Token CSRF obtenido (fallback)')
          }
          return
        }
        
        const token = csrfService.readFromCookie('XSRF-TOKEN')
        if (token) {
          csrfService.setToken(token)
          if (import.meta.env.DEV) {
            console.log('[useCsrfToken] ✅ Token CSRF obtenido (fallback)')
          }
          return
        }
      }
      
      if (import.meta.env.DEV) {
        console.warn('[useCsrfToken] ⚠️ Backend no respondió con token CSRF')
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[useCsrfToken] ❌ Error al solicitar token CSRF:', error)
      }
    }
  }

  /**
   * Inicializa el token CSRF
   * Intenta leer de múltiples fuentes y solicita del backend si es necesario
   * 1. Meta tag (si el backend inyectó en HTML)
   * 2. Cookie XSRF-TOKEN (si fue recibida)
   * 3. Request al backend (si no lo encontró)
   */
  const initializeCsrfToken = async (): Promise<void> => {
    // Intentar leer de meta tag primero (inyectado por servidor)
    let token = csrfService.readFromHeader('X-CSRF-Token')
    
    // Si no está en meta tag, leer de cookie
    if (!token) {
      token = csrfService.readFromCookie('XSRF-TOKEN')
    }

    // Si encontramos un token, almacenarlo
    if (token) {
      csrfService.setToken(token)
      if (import.meta.env.DEV) {
        console.log('[useCsrfToken] ✅ Token CSRF inicializado exitosamente')
      }
    } else {
      // Si no encontramos el token, solicitarlo del backend
      if (import.meta.env.DEV) {
        console.log('[useCsrfToken] 🔍 Token no encontrado en meta tag/cookie, solicitando del backend...')
      }
      await fetchCsrfTokenFromBackend()
    }
  }

  /**
   * Hook para inicializar automáticamente al montar
   */
  onMounted(() => {
    initializeCsrfToken()
  })

  return {
    initializeCsrfToken,
    getToken: () => csrfService.getToken()
  }
}
