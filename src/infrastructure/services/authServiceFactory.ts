/**
 * Factory para crear instancias de AuthService
 * Permite inyección de configuración para testing y múltiples entornos
 */

import { AuthService } from './authService'
import type { IAuthService, AuthServiceConfig } from './IAuthService'

/**
 * Configuración por defecto del servicio de autenticación
 */
const defaultConfig: AuthServiceConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
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

  return new AuthService(finalConfig)
}

/**
 * Instancia singleton por defecto
 * 
 * Usa variables de entorno (VITE_*) para configuración
 * Se recomienda usar createAuthService() directamente para testing
 */
export const authService = createAuthService()
