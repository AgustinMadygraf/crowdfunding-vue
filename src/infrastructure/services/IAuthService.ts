/**
 * Interface de servicio de autenticación
 * Define el contrato que deben cumplir las implementaciones de autenticación
 */

import type { User } from '@/domain/user'

/**
 * Estado de autenticación (read-only para consultas externas)
 */
export interface AuthState {
  readonly user: User | null
  readonly token: string | null
  readonly isAuthenticated: boolean
  readonly isLoading: boolean
  readonly error: string | null
}

/**
 * Estado interno mutable (solo para implementación de AuthService)
 * Idéntico a AuthState pero sin readonly para permitir mutaciones internas
 */
export interface MutableAuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

/**
 * Información de configuración de Google OAuth
 */
export interface GoogleAuthConfig {
  configured: boolean
  clientIdPrefix: string
}

/**
 * Interface principal del servicio de autenticación
 * Separada en dos sub-interfaces para respetar Interface Segregation Principle
 */

/**
 * Interface de consulta (read-only)
 * Para componentes que solo necesitan leer estado
 */
export interface IAuthQuery {
  /**
   * Obtiene el usuario actual autenticado
   */
  getCurrentUser(): User | null

  /**
   * Obtiene el token de autenticación actual
   */
  getAuthToken(): string | null

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean

  /**
   * Obtiene el estado completo de autenticación (inmutable)
   */
  getAuthState(): Readonly<AuthState>

  /**
   * Obtiene headers HTTP con token de autenticación
   */
  getAuthHeaders(): Record<string, string>

  /**
   * Verifica si Google OAuth está configurado
   */
  isGoogleConfigured(): boolean

  /**
   * Obtiene información de configuración de Google
   */
  getConfigInfo(): GoogleAuthConfig

  /**
   * Refresca el token JWT si está próximo a expirar (< 5 minutos)
   * @returns true si el token es válido o fue refrescado, false si expiró
   */
  refreshTokenIfNeeded(): Promise<boolean>
}

/**
 * Interface de comandos (write)
 * Para componentes que necesitan modificar estado de autenticación
 */
export interface IAuthCommand {
  /**
   * Inicia sesión con Google OAuth
   * @param token Token de ID de Google
   * @returns Usuario autenticado
   * @throws Error si falla la autenticación
   */
  loginWithGoogle(token: string): Promise<User>

  /**
   * Cierra sesión del usuario actual
   */
  logout(): void

  /**
   * Inicializa el botón de Google Sign-In en el DOM
   * @param containerId ID del contenedor donde renderizar el botón
   * @param callback Función a llamar cuando se recibe credencial de Google
   */
  initGoogleSignIn(
    containerId: string,
    callback: (token: string) => void
  ): void
}

/**
 * Interface completa de servicio de autenticación
 * Combina capacidades de consulta y comando
 */
export interface IAuthService extends IAuthQuery, IAuthCommand {}

/**
 * Factory type para crear instancias del servicio
 */
export type AuthServiceFactory = (config?: AuthServiceConfig) => IAuthService

/**
 * Configuración del servicio de autenticación
 */
export interface AuthServiceConfig {
  apiBaseUrl?: string
  googleClientId?: string
  tokenStorageKey?: string
  userStorageKey?: string
}
