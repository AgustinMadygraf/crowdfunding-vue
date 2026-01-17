/**
 * Composable para integración con Chatwoot Widget SDK
 * Maneja: setUser(), setCustomAttributes(), eventos ready
 * 
 * Documentación: https://developers.chatwoot.com/docs/product/channels/live-chat/sdk-api
 */

import { ref, onMounted } from 'vue'


/**
 * Estado de disponibilidad del widget Chatwoot
 */
export interface ChatwootState {
  isReady: boolean
  isError: boolean
  errorMessage: string | null
}

/**
 * Parámetros para setUser()
 */
export interface ChatwootUserIdentity {
  name?: string
  email?: string
  identifier_hash?: string // Provided by backend (HMAC), not computed in frontend
  phone_number?: string
  avatar_url?: string
}

/**
 * Atributos personalizados (siempre flattened, nunca objetos anidados)
 */
export type ChatwootCustomAttributes = Record<string, string | number | boolean>

/**
 * Composable para Chatwoot
 * @returns Métodos y estado para interactuar con Chatwoot widget
 */
export function useChatwoot() {
  const state = ref<ChatwootState>({
    isReady: false,
    isError: false,
    errorMessage: null
  })

  /**
   * Obtiene la referencia al SDK de Chatwoot
   */
  const getChatwootSDK = (): any => {
    if (typeof window === 'undefined') return null
    return (window as any).$chatwoot
  }

  /**
   * Espera a que el evento 'chatwoot:ready' se dispare
   * @param timeout - Tiempo máximo para esperar (ms)
   * @returns Promise que se resuelve cuando está listo o timeout
   */
  const waitForChatwootReady = (timeout = 5000): Promise<boolean> => {
    return new Promise((resolve) => {
      const sdk = getChatwootSDK()
      
      // Si ya está listo, resolver inmediatamente
      if (sdk) {
        state.value.isReady = true
        resolve(true)
        return
      }

      let timeoutId: ReturnType<typeof setTimeout> | null = null

      const handleReady = () => {
        state.value.isReady = true
        state.value.isError = false
        if (timeoutId) clearTimeout(timeoutId)
        window.removeEventListener('chatwoot:ready', handleReady)
        resolve(true)
      }

      window.addEventListener('chatwoot:ready', handleReady)

      if (timeout > 0) {
        timeoutId = setTimeout(() => {
          state.value.isError = true
          state.value.errorMessage = `Chatwoot no cargó en ${timeout}ms`
          window.removeEventListener('chatwoot:ready', handleReady)
          resolve(false)
        }, timeout)
      }
    })
  }

  /**
   * Identifica al usuario actual en Chatwoot
   * @param identifier - ID único del usuario (ej: subscription_id)
   */
  const setUser = async (identifier: string, identity: ChatwootUserIdentity = {}): Promise<boolean> => {
    try {
      const isReady = await waitForChatwootReady()
      if (!isReady) {
        console.warn('Chatwoot no está listo. Intentando setUser de todas formas.')
      }

      const sdk = getChatwootSDK()
      if (!sdk) {
        state.value.isError = true
        state.value.errorMessage = 'Chatwoot SDK no disponible'
        console.error('window.$chatwoot no encontrado')
        return false
      }

      sdk.setUser(identifier, identity)
      state.value.isError = false
      return true
    } catch (error) {
      state.value.isError = true
      state.value.errorMessage = `Error en setUser: ${(error as Error).message}`
      console.error('Error calling setUser:', error)
      return false
    }
  }

  /**
   * Establece atributos personalizados del usuario
   * IMPORTANTE: debe ser JSON flattened (no objetos anidados)
   * @param attributes - Objeto con atributos (key-value)
   */
  const setCustomAttributes = async (
    attributes: ChatwootCustomAttributes
  ): Promise<boolean> => {
    try {
      const isReady = await waitForChatwootReady()
      if (!isReady) {
        console.warn('Chatwoot no está listo. Intentando setCustomAttributes de todas formas.')
      }

      const sdk = getChatwootSDK()
      if (!sdk) {
        state.value.isError = true
        state.value.errorMessage = 'Chatwoot SDK no disponible'
        console.error('window.$chatwoot no encontrado')
        return false
      }

      // Validar que los atributos sean flattened (solo valores primitivos)
      Object.entries(attributes).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          console.warn(
            `Custom attribute "${key}" es un objeto. Chatwoot requiere valores primitivos. Convirtiendo a JSON string.`
          )
          attributes[key] = JSON.stringify(value)
        }
      })

      sdk.setCustomAttributes(attributes)
      state.value.isError = false
      return true
    } catch (error) {
      state.value.isError = true
      state.value.errorMessage = `Error en setCustomAttributes: ${(error as Error).message}`
      console.error('Error calling setCustomAttributes:', error)
      return false
    }
  }

  /**
   * Abre el widget de Chatwoot
   */
  const openWidget = async (): Promise<boolean> => {
    try {
      const isReady = await waitForChatwootReady()
      if (!isReady) return false

      const sdk = getChatwootSDK()
      if (!sdk) return false

      sdk.open()
      return true
    } catch (error) {
      console.error('Error opening Chatwoot widget:', error)
      return false
    }
  }

  /**
   * Cierra el widget de Chatwoot
   */
  const closeWidget = async (): Promise<boolean> => {
    try {
      const sdk = getChatwootSDK()
      if (!sdk) return false

      sdk.close()
      return true
    } catch (error) {
      console.error('Error closing Chatwoot widget:', error)
      return false
    }
  }

  /**
   * Toggle del widget (abre si está cerrado, cierra si está abierto)
   */
  const toggleWidget = async (): Promise<boolean> => {
    try {
      const sdk = getChatwootSDK()
      if (!sdk) return false

      sdk.toggle()
      return true
    } catch (error) {
      console.error('Error toggling Chatwoot widget:', error)
      return false
    }
  }

  /**
   * Hook: esperar a que Chatwoot esté listo al montar el componente
   */
  const initializeChatwoot = (callback?: () => void) => {
    onMounted(async () => {
      const isReady = await waitForChatwootReady()
      if (isReady && callback) {
        callback()
      }
    })
  }

  /**
   * Limpia errores
   */
  const clearError = () => {
    state.value.isError = false
    state.value.errorMessage = null
  }

  /**
   * Envia un mensaje de texto al chat de Chatwoot
   * @param message - Mensaje a enviar
   */
  const sendChatwootMessage = async (message: string) => {
    try {
      const isReady = await waitForChatwootReady()
      if (!isReady) {
        console.warn('Chatwoot no está listo. Intentando enviar mensaje de todas formas.')
      }

      const sdk = getChatwootSDK()
      if (!sdk) {
        state.value.isError = true
        state.value.errorMessage = 'Chatwoot SDK no disponible'
        console.error('window.$chatwoot no encontrado')
        return false
      }

      sdk.sendMessage(message)
      state.value.isError = false
      return true
    } catch (error) {
      console.error('Error enviando mensaje a Chatwoot (composable)', error)
      state.value.isError = true
      state.value.errorMessage = `Error en sendChatwootMessage: ${(error as Error).message}`
      console.error('Error calling sendChatwootMessage:', error)
      return false
    }
  }

  return {
    // Estado
    state,

    // Métodos principales
    setUser,
    setCustomAttributes,

    // Métodos secundarios
    openWidget,
    closeWidget,
    toggleWidget,

    // Helpers
    initializeChatwoot,
    waitForChatwootReady,
    getChatwootSDK,
    clearError,

    // Envío de mensajes
    sendChatwootMessage
  }
}
