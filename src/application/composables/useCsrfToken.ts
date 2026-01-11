/**
 * Composable para inicializar y gestionar CSRF token
 */

import { onMounted } from 'vue'
import { csrfService } from '@/infrastructure/services/csrfService'

/**
 * Composable para cargar y gestionar el token CSRF
 * Debe llamarse en el componente raíz (App.vue) para asegurar disponibilidad global
 */
export function useCsrfToken() {
  /**
   * Inicializa el token CSRF
   * Intenta leer de:
   * 1. Meta tag (si el backend lo proporciona)
   * 2. Cookie (si el backend lo proporciona)
   * 3. localStorage (de sesiones anteriores)
   */
  const initializeCsrfToken = (): void => {
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
    } else if (import.meta.env.DEV) {
      console.warn('[useCsrfToken] ⚠️ Token CSRF no encontrado - El backend debe proporcionarlo')
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
