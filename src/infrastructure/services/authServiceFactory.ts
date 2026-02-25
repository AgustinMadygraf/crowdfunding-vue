/**
 * Factory para crear instancias de AuthService
 * Permite inyección de configuración para testing y múltiples entornos
 */

import { AuthService } from './authService'
import { getAppConfig } from '@/config/appConfig'
import type { IAuthService, AuthServiceConfig } from './IAuthService'
import { SessionStorageTokenStorage } from './auth/tokenStorage'
import { GoogleSignInAdapter } from './auth/googleSignInAdapter'
import { logger } from '@/infrastructure/logging/logger'


/**
 * Configuración por defecto del servicio de autenticación
 */
const appConfig = getAppConfig()
const defaultConfig: AuthServiceConfig = {
  apiBaseUrl: appConfig.apiBaseUrl,
  googleClientId: appConfig.googleClientId,
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
  try {
    const finalConfig: AuthServiceConfig = {
      ...defaultConfig,
      ...config
    }

    // Política vigente: sessionStorage para token y usuario (intermedio hasta cookies httpOnly + CSRF)
    const storage = new SessionStorageTokenStorage(
      finalConfig.tokenStorageKey || 'auth_token',
      finalConfig.userStorageKey || 'auth_user'
    )
    const googleSignIn = new GoogleSignInAdapter()

    return new AuthService(finalConfig, { storage, googleSignIn })
  } catch (error) {
    logger.event('error', {
      code: 'AUTH_SERVICE_FACTORY_CREATE_FAILED',
      context: 'Error creando AuthService',
      safeDetails: { errorType: error instanceof Error ? error.name : typeof error }
    })
    throw error
  }
}

/**
 * Instancia singleton por defecto
 * 
 * Usa variables de entorno (VITE_*) para configuración
 * Se recomienda usar createAuthService() directamente para testing
 * 
 * Política vigente: usa SessionStorageTokenStorage
 */
export const authService = new AuthService(
  {
    apiBaseUrl: appConfig.apiBaseUrl,
    googleClientId: appConfig.googleClientId
  },
  {
    storage: new SessionStorageTokenStorage('auth_token', 'auth_user'),
    googleSignIn: new GoogleSignInAdapter()
  }
)
