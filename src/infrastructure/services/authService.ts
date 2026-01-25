/**
 * Servicio de Autenticación con Google OAuth
 * Maneja login/logout y gestión de sesiones
 */

import type { User } from '@/domain/user'
// import type { Credentials } from '@/domain/user' // Eliminado: no existe export Credentials
import type { IAuthService, AuthState, MutableAuthState, GoogleAuthConfig, AuthServiceConfig } from './IAuthService'
import type { AuthGatewayPort } from '@/application/ports/AuthGateway'
import { LoginWithGoogleUseCase } from '@/application/usecases/LoginWithGoogleUseCase'
import { DefaultTokenStorage, type TokenStorage } from './auth/tokenStorage'
import { DefaultGoogleOAuthProvider, type GoogleOAuthProvider } from './auth/googleOAuthProvider'
import { HttpAuthGateway } from './auth/httpAuthGateway'
import { RefreshTokenUseCase } from '@/application/usecases/RefreshTokenUseCase'
import { ShouldRefreshTokenUseCase } from '@/application/usecases/ShouldRefreshTokenUseCase'
import { ValidateJwtUseCase } from '@/application/usecases/ValidateJwtUseCase'
import { LogoutUseCase } from '@/application/usecases/LogoutUseCase'
import type { SessionStoragePort } from '@/application/ports/SessionStoragePort'
import { LoadStoredAuthUseCase } from '@/application/usecases/LoadStoredAuthUseCase'
import { BuildAuthHeadersUseCase } from '@/application/usecases/BuildAuthHeadersUseCase'
import { RateLimitLoginUseCase, type RateLimitState } from '@/application/usecases/RateLimitLoginUseCase'
import { GetGoogleConfigInfoUseCase } from '@/application/usecases/GetGoogleConfigInfoUseCase'

const logger = import.meta.env.DEV
  ? console
  : { log: () => undefined, warn: () => undefined, error: () => undefined }



export class AuthService implements IAuthService {
  private authState: MutableAuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  }

  private readonly API_BASE_URL: string
  private readonly GOOGLE_CLIENT_ID: string
  private readonly TOKEN_STORAGE_KEY: string
  private readonly USER_STORAGE_KEY: string
  private loginAttempts: { timestamp: number }[] = []
  private readonly MAX_LOGIN_ATTEMPTS = 5
  private readonly LOGIN_TIMEOUT_MS = 60000 // 1 minuto
  private readonly storage: SessionStoragePort
  private readonly provider: GoogleOAuthProvider
  private readonly gateway: AuthGatewayPort
  private readonly loginWithGoogleUseCase: LoginWithGoogleUseCase
  private readonly refreshTokenUseCase: RefreshTokenUseCase
  private readonly shouldRefreshTokenUseCase: ShouldRefreshTokenUseCase
  private readonly validateJwtUseCase: ValidateJwtUseCase
  private readonly logoutUseCase: LogoutUseCase
  private readonly loadStoredAuthUseCase: LoadStoredAuthUseCase
  private readonly buildAuthHeadersUseCase: BuildAuthHeadersUseCase
  private readonly rateLimitLoginUseCase: RateLimitLoginUseCase
  private readonly getGoogleConfigInfoUseCase: GetGoogleConfigInfoUseCase

  constructor(
    config?: AuthServiceConfig,
    deps?: {
      storage?: TokenStorage
      provider?: GoogleOAuthProvider
      gateway?: AuthGatewayPort
      loginUseCase?: LoginWithGoogleUseCase
      refreshUseCase?: RefreshTokenUseCase
      shouldRefreshUseCase?: ShouldRefreshTokenUseCase
      validateJwtUseCase?: ValidateJwtUseCase
      logoutUseCase?: LogoutUseCase
      loadStoredAuthUseCase?: LoadStoredAuthUseCase
      buildAuthHeadersUseCase?: BuildAuthHeadersUseCase
      rateLimitLoginUseCase?: RateLimitLoginUseCase
      getGoogleConfigInfoUseCase?: GetGoogleConfigInfoUseCase
    }
  ) {
    // Aplicar configuración con fallback a variables de entorno
    this.API_BASE_URL = config?.apiBaseUrl || ''
    this.GOOGLE_CLIENT_ID = config?.googleClientId || ''
    this.TOKEN_STORAGE_KEY = config?.tokenStorageKey || 'auth_token'
    this.USER_STORAGE_KEY = config?.userStorageKey || 'auth_user'

    // Inicializar dependencias
    this.storage = deps?.storage ?? new DefaultTokenStorage(
      config?.tokenStorageKey || 'auth_token',
      config?.userStorageKey || 'auth_user'
    )
    this.provider = deps?.provider ?? new DefaultGoogleOAuthProvider()
    this.gateway = deps?.gateway ?? new HttpAuthGateway(this.API_BASE_URL)
    this.loginWithGoogleUseCase = deps?.loginUseCase ?? new LoginWithGoogleUseCase(this.gateway)
    this.refreshTokenUseCase = deps?.refreshUseCase ?? new RefreshTokenUseCase(this.gateway)
    this.shouldRefreshTokenUseCase = deps?.shouldRefreshUseCase ?? new ShouldRefreshTokenUseCase()
    this.validateJwtUseCase = deps?.validateJwtUseCase ?? new ValidateJwtUseCase()
    this.logoutUseCase = deps?.logoutUseCase ?? new LogoutUseCase(this.storage)
    this.loadStoredAuthUseCase =
      deps?.loadStoredAuthUseCase ?? new LoadStoredAuthUseCase(this.storage, this.validateJwtUseCase)
    this.buildAuthHeadersUseCase = deps?.buildAuthHeadersUseCase ?? new BuildAuthHeadersUseCase()
    this.rateLimitLoginUseCase =
      deps?.rateLimitLoginUseCase ?? new RateLimitLoginUseCase(this.MAX_LOGIN_ATTEMPTS, this.LOGIN_TIMEOUT_MS)
    this.getGoogleConfigInfoUseCase = deps?.getGoogleConfigInfoUseCase ?? new GetGoogleConfigInfoUseCase()

    if (!this.API_BASE_URL) {
      throw new Error('AuthService requires apiBaseUrl in config.')
    }

    // Validar que el client_id esté configurado
    if (!this.GOOGLE_CLIENT_ID) {
      logger.error('[Auth] VITE_GOOGLE_CLIENT_ID no configurado; revisa .env')
      this.authState.error = 'Configuración de Google OAuth incompleta'
    } else {
      // Solo loguear client ID en desarrollo por seguridad
    }

    // Validar que API use HTTPS en producción
    if (import.meta.env.PROD && !this.API_BASE_URL.startsWith('https://')) {
      logger.warn('[Auth] API_BASE_URL deberia usar HTTPS en produccion')
    }

    this.loadStoredAuth()
    this.loadGoogleScript()
  }

  /**
   * Decodifica un JWT y retorna su payload
   * @param token JWT en formato xxx.yyy.zzz
   * @returns Payload decodificado o null si no es JWT válido
   */
  /**
   * Valida si un JWT ha expirado
   * @param token JWT a validar
   * @returns true si el token es válido y no expiró, false si expiró o no es JWT
   */
  private isTokenValid(token: string): boolean {
    const validation = this.validateJwtUseCase.execute(token)

    if (validation.reason === 'invalid_format' || validation.reason === 'decode_error') {
      logger.warn('[Auth] ⚠️ No se pudo decodificar token para validar expiración')
      return true
    }

    if (validation.reason === 'missing_exp') {
      logger.warn('[Auth] ⚠️ JWT sin claim \"exp\"; no se puede validar expiración en frontend')
      return true
    }

    if (validation.reason === 'expired') {
      const exp = validation.payload?.exp
      if (exp) {
        const expiredDate = new Date(exp * 1000).toLocaleString('es-AR')
        logger.warn('[Auth] ⏰ Token expiró el', expiredDate);
      }
      return false
    }

    return true
  }

  /**
   * Carga el script de Google Identity Services
   */
  private loadGoogleScript(): void {
    this.provider.loadScript()
  }

  private ensureLoginRateLimit(): void {
    const result = this.rateLimitLoginUseCase.execute(
      { attempts: this.loginAttempts },
      Date.now()
    )
    this.loginAttempts = result.nextState.attempts

    if (!result.allowed) {
      const waitTime = result.waitTimeSeconds ?? 0
      const errorMsg = `Demasiados intentos de login. Espera ${waitTime} segundos.`
      logger.warn(`[Auth] Rate limit alcanzado: ${this.loginAttempts.length} intentos en 1 minuto`)
      this.authState.error = errorMsg
      throw new Error(errorMsg)
    }
  }

  private persistAuth(user: User, token: string): void {
    this.authState.user = user
    this.authState.token = token
    this.authState.isAuthenticated = true

    this.storage.save(user, token)
  }




  /**
   * Inicia sesión con Google
   * @param token Token de ID de Google
   */
  async loginWithGoogle(token: string): Promise<User> {
    this.ensureLoginRateLimit()
    this.authState.isLoading = true
    this.authState.error = null

    try {
      // Validar que el token esté disponible
      if (!token || token.trim() === '') {
        const errorMsg = 'Token de Google no válido'
        logger.error(`[Auth] ❌ ${errorMsg}`);
        throw new Error(errorMsg)
      }
      
      const result = await this.loginWithGoogleUseCase.execute(token)

      try {
        this.persistAuth(result.user, result.authToken)
      } catch (storageError) {
        logger.warn('[Auth] Error al guardar en localStorage:', storageError);
      }

      return result.user
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido'
      this.authState.error = message
      logger.error('[Auth] Error de autenticacion:', message);
      throw error
    } finally {
      this.authState.isLoading = false
    }
  }

  /**
   * Cierra sesión
   */
  logout(): void {
    try {
      
      const result = this.logoutUseCase.execute()
      this.authState.user = result.nextState.user
      this.authState.token = result.nextState.token
      this.authState.isAuthenticated = result.nextState.isAuthenticated
      this.authState.error = result.nextState.error

      // Revocar sesión de Google si está disponible
      try {
        this.provider.disableAutoSelect()
      } catch (googleError) {
        logger.warn('[Auth] ⚠️ Error al revocar sesión de Google:', googleError)
      }
    } catch (error) {
      logger.error('[Auth] ❌ Error inesperado al cerrar sesión:', error);
    }
  }

  /**
   * Carga autenticación previamente almacenada
   */
  private loadStoredAuth(): void {
    try {
      const result = this.loadStoredAuthUseCase.execute()
      if (result.shouldLogout) {
        logger.warn('[Auth] Token expirado, cerrando sesion...')
        this.logout()
        return
      }

      this.authState.user = result.user
      this.authState.token = result.token
      this.authState.isAuthenticated = result.isAuthenticated
    } catch (error) {
      logger.error('[Auth] Error al cargar autenticacion almacenada; limpiando sesion')
      this.logout()
    }
  }

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser(): User | null {
    return this.authState.user
  }

  /**
   * Obtiene el token de autenticación
   */
  getAuthToken(): string | null {
    return this.authState.token
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.authState.isAuthenticated
  }

  /**
   * Obtiene el estado actual de autenticación
   */
  getAuthState(): Readonly<AuthState> {
    return Object.freeze({ ...this.authState })
  }

  /**
   * Obtiene headers con token de autenticación
   */
  getAuthHeaders(): Record<string, string> {
    return this.buildAuthHeadersUseCase.execute(this.authState.token)
  }

  /**
   * Refresca el token JWT de forma silenciosa antes de que expire
   * Se ejecuta proactivamente 5 minutos antes de la expiración
   */
  private async silentRefresh(): Promise<boolean> {
    if (!this.authState.token) {
      logger.warn('[Auth] ⚠️ No hay token disponible para refrescar')
      return false
    }

    try {

      let newToken: string
      try {
        newToken = await this.refreshTokenUseCase.execute(this.authState.token)
      } catch (error) {
        const message = error instanceof Error ? error.message : ''
        if (message.includes('401')) {
          logger.warn('[Auth] Token refresh rechazado (401). Sesion expirada.')
          this.logout()
          return false
        }
        throw error
      }

      // Validar nuevo token
      if (!newToken || newToken.trim() === '') {
        logger.error('[Auth] Backend retorno token vacio')
        return false
      }

      // Actualizar token en estado y storage
      this.authState.token = newToken
      if (this.authState.user) {
        this.storage.save(this.authState.user, newToken)
      }

      if (import.meta.env.DEV) {
        const validation = this.validateJwtUseCase.execute(newToken)
        const exp = validation.payload?.exp
        const expiresIn = exp ? exp - Math.floor(Date.now() / 1000) : 0
        const minutesLeft = Math.floor(expiresIn / 60)
      }

      return true
    } catch (error) {
      logger.error('[Auth] ❌ Error al refrescar token:', error)
      this.logout()
      return false
    }
  }

  /**
   * Verifica si el token está próximo a expirar y lo refresca si es necesario
   * Se debe llamar antes de operaciones críticas
   */
  async refreshTokenIfNeeded(): Promise<boolean> {
    if (!this.authState.token || !this.authState.isAuthenticated) {
      return false
    }

    const refreshDecision = this.shouldRefreshTokenUseCase.execute(this.authState.token)
    if (!refreshDecision.canEvaluate) {
      return false
    }

    if (!refreshDecision.shouldRefresh) {
      return true
    }

    return await this.silentRefresh()
  }

  /**
   * Verifica si Google Client ID está configurado
   */
  isGoogleConfigured(): boolean {
    return !!this.GOOGLE_CLIENT_ID && this.GOOGLE_CLIENT_ID.trim() !== ''
  }

  /**
   * Obtiene información de configuración (sin exponer el client_id completo)
   */
  getConfigInfo(): { configured: boolean; clientIdPrefix: string } {
    return this.getGoogleConfigInfoUseCase.execute(this.GOOGLE_CLIENT_ID)
  }

  /**
   * Inicializa Google Sign-In
   * @param containerId ID del contenedor para el botón
   * @param callback Callback cuando el usuario se autentica
   */
  initGoogleSignIn(
    containerId: string,
    callback: (token: string) => void
  ): void {
    try {
      
      // Validar que Google SDK esté cargado
      if (!this.provider.isReady()) {
        const errorMsg = 'Google Identity Services SDK no est?? cargado'
        logger.error(`[Auth] ${errorMsg}; verifica SDK y conexion`)
        this.authState.error = 'SDK de Google no disponible'
        return
      }

      // Validar que el client_id esté configurado
      if (!this.GOOGLE_CLIENT_ID || this.GOOGLE_CLIENT_ID.trim() === '') {
        const errorMsg = 'client_id de Google no configurado'
        logger.error(`[Auth] ${errorMsg}; revisa .env`)
        this.authState.error = 'Client ID no configurado'
        return
      }

      try {
        this.provider.initialize(
          this.GOOGLE_CLIENT_ID,
          (cred) => {
            try {
              callback(cred)
            } catch (callbackError) {
              logger.error('[Auth] Error en callback de autenticacion')
              this.authState.error = 'Error procesando autenticación'
            }
          },
          (error: any) => {
            logger.error('[Auth] Origen no autorizado en Google Cloud Console')
            this.authState.error = `Origen ${window.location.origin} no autorizado en Google Cloud Console. Ver consola para instrucciones.`
          }
        )
        
        // Monitorear errores de red de Google después de inicializar
        setTimeout(() => {
          if (this.authState.error && this.authState.error.includes('no autorizado')) {
            logger.error('[Auth] Error 403: origen no autorizado en Google Cloud Console')
          }
        }, 2000)
      } catch (initError) {
        logger.error('[Auth] Error al inicializar Google Sign-In')
        throw initError
      }

      const container = document.getElementById(containerId)
      if (!container) {
        logger.error(`[Auth] Contenedor #${containerId} no encontrado en el DOM`)
        return
      }

      try {
        this.provider.renderButton(container)
        
        // Variable para rastrear si se detectó el error 403
        let error403Detected = false
        let gsiLoggerDetected = false
        
        // Capturar mensajes de error específicos de GSI
        const originalConsoleError = logger.error
        const checkForGSIError = (...args: any[]) => {
          const msg = args.join(' ')
          if (msg.includes('GSI') || msg.includes('gsi')) {
            if (msg.includes('origin') && msg.includes('not allowed')) {
              gsiLoggerDetected = true
            }
          }
        }
        
        // Monitorear errores de red en el Performance API
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name.includes('accounts.google.com') && 
                (entry as any).responseStatus === 403) {
              error403Detected = true
            }
          }
        })
        
        try {
          observer.observe({ entryTypes: ['resource'] })
        } catch (e) {
          // Performance API no disponible o no soportado
        }
        
        // Verificar estado después de renderizar
        setTimeout(() => {
          observer.disconnect()
          
          // Buscar iframes de Google en el DOM
          const googleIframes = document.querySelectorAll('iframe[src*="accounts.google.com"], iframe[id*="gsi"]')
          const hasButton = container.querySelector('iframe, div[role="button"]')
          
          // Solo mostrar diagnóstico si:
          // 1. No hay iframe en absoluto O
          // 2. Se detectó GSI_LOGGER con error de origin
          if (googleIframes.length === 0 || gsiLoggerDetected) {
            if (gsiLoggerDetected || googleIframes.length === 0) {
              logger.error('[Auth] Diagnostico Google Sign-In fallido')
            }
                      } else {
          }
        }, 3000)
      } catch (renderError) {
        logger.error('[Auth] Error al renderizar boton de Google Sign-In')
        throw renderError
      }
    } catch (error) {
      logger.error('[Auth] Error al inicializar Google Sign-In')
      this.authState.error = 'Error de inicialización de Google Sign-In'
      throw error
    }
  }
}

// Tipos para Google Identity
interface CredentialResponse {
  credential: string
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void
          renderButton: (element: HTMLElement, options: any) => void
          disableAutoSelect: () => void
        }
      }
    }
  }
}

// Exportar clase y tipos
export type { User }
export type { IAuthService, IAuthQuery, IAuthCommand, AuthState, MutableAuthState, GoogleAuthConfig, AuthServiceConfig } from './IAuthService'

// Ajustar tipo de credentials si es necesario
export async function authenticateUser(credentials: any) {
  try {
    // ...existing code...
  } catch (error) {
    logger.error('Error autenticando usuario', error)
    throw error
  }
}
