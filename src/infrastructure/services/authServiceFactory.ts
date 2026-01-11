/**
 * Factory para crear instancias de AuthService
 * Permite inyección de configuración para testing y múltiples entornos
 */

import { AuthService } from './authService'
import { getApiBaseUrl } from '@/config/api'
import type { IAuthService, AuthServiceConfig } from './IAuthService'
import { DefaultTokenStorage } from './auth/tokenStorage'
import { DefaultGoogleOAuthProvider } from './auth/googleOAuthProvider'

/**
 * Configuración por defecto del servicio de autenticación
 */
const defaultConfig: AuthServiceConfig = {
  apiBaseUrl: getApiBaseUrl(),
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  tokenStorageKey: 'auth_token',
  userStorageKey: 'auth_user'
}

/**
 * Factory function para crear instancias de AuthService
 * 
 * @param config Configuración opcional (se fusiona con defaults)
 * @returns Instancia de IAuthService configurada
 * 
 * @example
 * // Usar configuración por defecto (variables de entorno)
 * const authService = createAuthService()
 * 
 * @example
 * // Configuración personalizada para testing
 * const testAuthService = createAuthService({
 *   apiBaseUrl: 'http://test-api.local',
 *   googleClientId: 'test-client-id',
 *   tokenStorageKey: 'test_token',
 *   userStorageKey: 'test_user'
 * })
 * 
 * @example
 * // Sobrescribir solo algunos valores
 * const prodAuthService = createAuthService({
 *   apiBaseUrl: 'https://api.production.com'
 * })
 */
export function createAuthService(config?: Partial<AuthServiceConfig>): IAuthService {
  const finalConfig: AuthServiceConfig = {
    ...defaultConfig,
    ...config
  }

  const storage = new DefaultTokenStorage(
    finalConfig.tokenStorageKey || 'auth_token',
    finalConfig.userStorageKey || 'auth_user'
  )
  const provider = new DefaultGoogleOAuthProvider()

  return new AuthService(finalConfig, { storage, provider })
}

/**
 * Instancia singleton por defecto
 * 
 * Usa variables de entorno (VITE_*) para configuración
 * Se recomienda usar createAuthService() directamente para testing
 */
export const authService = new AuthService({
  apiBaseUrl: getApiBaseUrl(),
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID
})
