/**
 * Composable para inicializar y gestionar CSRF token
 */

import { onMounted } from 'vue'
import { csrfService } from '@/infrastructure/services/csrfService'
import { getAppConfig } from '@/config/appConfig'


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
    const apiBaseUrl = getAppConfig().apiBaseUrl
    
    // Estrategia 1: Endpoint dedicado /api/csrf-token (RECOMENDADO)
    // Si backend implementa este endpoint, es la forma más eficiente
    try {
      if (import.meta.env.DEV) {
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
          }
          return
        }
        
        const token = csrfService.readFromCookie('XSRF-TOKEN')
        if (token) {
          csrfService.setToken(token)
          if (import.meta.env.DEV) {
          }
          return
        }
      }
    } catch (error) {
      if (import.meta.env.DEV) {
      }
    }
    
    // Estrategia 2: Fallback - Usar endpoint existente GET /api/contributions
    // Esta estrategia funciona pero carga datos innecesarios
    try {
      if (import.meta.env.DEV) {
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
          }
          return
        }
        
        const token = csrfService.readFromCookie('XSRF-TOKEN')
        if (token) {
          csrfService.setToken(token)
          if (import.meta.env.DEV) {
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
      }
    } else {
      // Si no encontramos el token, solicitarlo del backend
      if (import.meta.env.DEV) {
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

  async function getCsrfToken() {
    try {
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
        }
      } else {
        // Si no encontramos el token, solicitarlo del backend
        if (import.meta.env.DEV) {
        }
        await fetchCsrfTokenFromBackend()
      }
    } catch (error) {
      console.error('Error obteniendo CSRF token (composable)', error)
      throw error
    }
  }

  return {
    initializeCsrfToken,
    getToken: () => csrfService.getToken()
  }
}
