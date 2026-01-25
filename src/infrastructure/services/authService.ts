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
import type { GoogleSignInPort } from '@/application/ports/GoogleSignInPort'
import { GoogleSignInAdapter } from './auth/googleSignInAdapter'
import { HttpAuthGateway } from './auth/httpAuthGateway'
import { RefreshTokenUseCase } from '@/application/usecases/RefreshTokenUseCase'
import { ShouldRefreshTokenUseCase } from '@/application/usecases/ShouldRefreshTokenUseCase'
import { ValidateJwtUseCase } from '@/application/usecases/ValidateJwtUseCase'
import { LogoutUseCase } from '@/application/usecases/LogoutUseCase'
import type { SessionStoragePort } from '@/application/ports/SessionStoragePort'
import type { DocumentQueryPort } from '@/application/ports/DocumentQueryPort'
import { LoadStoredAuthUseCase } from '@/application/usecases/LoadStoredAuthUseCase'
import { BuildAuthHeadersUseCase } from '@/application/usecases/BuildAuthHeadersUseCase'
import { RateLimitLoginUseCase } from '@/application/usecases/RateLimitLoginUseCase'
import { GetGoogleConfigInfoUseCase } from '@/application/usecases/GetGoogleConfigInfoUseCase'
import { DocumentQueryAdapter } from './dom/documentQueryAdapter'
import type { PerformanceObserverPort } from '@/application/ports/PerformanceObserverPort'
import { PerformanceObserverAdapter } from './dom/performanceObserverAdapter'
import type { TimerPort } from '@/application/ports/TimerPort'
import { TimerAdapter } from './dom/timerAdapter'
import type { RuntimeEnvPort } from '@/application/ports/RuntimeEnvPort'
import { RuntimeEnvAdapter } from './dom/runtimeEnvAdapter'

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
  private loginAttempts: { timestamp: number }[] = []
  private readonly MAX_LOGIN_ATTEMPTS = 5
  private readonly LOGIN_TIMEOUT_MS = 60000 // 1 minuto
  private readonly storage: SessionStoragePort
  private readonly googleSignIn: GoogleSignInPort
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
  private readonly documentQuery: DocumentQueryPort
  private readonly performanceObserver: PerformanceObserverPort
  private readonly timer: TimerPort
  private readonly runtimeEnv: RuntimeEnvPort

  constructor(
    config?: AuthServiceConfig,
    deps?: {
      storage?: TokenStorage
      googleSignIn?: GoogleSignInPort
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
      documentQuery?: DocumentQueryPort
      performanceObserver?: PerformanceObserverPort
      timer?: TimerPort
      runtimeEnv?: RuntimeEnvPort
    }
  ) {
    // Aplicar configuración con fallback a variables de entorno
    this.API_BASE_URL = config?.apiBaseUrl || ''
    this.GOOGLE_CLIENT_ID = config?.googleClientId || ''

    // Inicializar dependencias
    this.storage = deps?.storage ?? new DefaultTokenStorage(
      config?.tokenStorageKey || 'auth_token',
      config?.userStorageKey || 'auth_user'
    )
    this.googleSignIn = deps?.googleSignIn ?? new GoogleSignInAdapter()
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
    this.documentQuery = deps?.documentQuery ?? new DocumentQueryAdapter()
    this.performanceObserver = deps?.performanceObserver ?? new PerformanceObserverAdapter()
    this.timer = deps?.timer ?? new TimerAdapter()
    this.runtimeEnv = deps?.runtimeEnv ?? new RuntimeEnvAdapter()

    if (!this.API_BASE_URL) {
      throw new Error('AuthService requires apiBaseUrl in config.')
    }

    // Validar que el client_id esté configurado
    if (!this.GOOGLE_CLIENT_ID) {
      logger.error('[AUTH_CFG_MISSING]')
      this.authState.error = 'Configuración de Google OAuth incompleta'
    } else {
      // Solo loguear client ID en desarrollo por seguridad
    }

    // Validar que API use HTTPS en producción
    if (import.meta.env.PROD && !this.API_BASE_URL.startsWith('https://')) {
      logger.warn('[AUTH_API_URL_HTTP]')
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
      logger.warn('[AUTH_JWT_DECODE_FAIL]')
      return true
    }

    if (validation.reason === 'missing_exp') {
      logger.warn('[AUTH_JWT_NO_EXP]')
      return true
    }

    if (validation.reason === 'expired') {
      logger.warn('[AUTH_JWT_EXPIRED]')
      return false
    }

    return true
  }

  /**
   * Carga el script de Google Identity Services
   */
  private loadGoogleScript(): void {
    this.googleSignIn.loadScript()
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
      logger.warn('[AUTH_RATE_LIMIT]')
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
        logger.error('[AUTH_TOKEN_INVALID]')
        throw new Error(errorMsg)
      }
      
      const result = await this.loginWithGoogleUseCase.execute(token)

      try {
        this.persistAuth(result.user, result.authToken)
      } catch (storageError) {
        logger.warn('[AUTH_STORAGE_SAVE_FAIL]')
      }

      return result.user
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido'
      this.authState.error = message
      logger.error('[AUTH_LOGIN_FAIL]')
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
        this.googleSignIn.disableAutoSelect()
      } catch (googleError) {
        logger.warn('[AUTH_GOOGLE_REVOKE_FAIL]')
      }
    } catch (error) {
      logger.error('[AUTH_LOGOUT_FAIL]')
    }
  }

  /**
   * Carga autenticación previamente almacenada
   */
  private loadStoredAuth(): void {
    try {
      const result = this.loadStoredAuthUseCase.execute()
      if (result.shouldLogout) {
        logger.warn('[AUTH_SESSION_EXPIRED]')
        this.logout()
        return
      }

      this.authState.user = result.user
      this.authState.token = result.token
      this.authState.isAuthenticated = result.isAuthenticated
    } catch (error) {
      logger.error('[AUTH_LOAD_SESSION_FAIL]')
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
      logger.warn('[AUTH_REFRESH_NO_TOKEN]')
      return false
    }

    try {

      let newToken: string
      try {
        newToken = await this.refreshTokenUseCase.execute(this.authState.token)
      } catch (error) {
        const message = error instanceof Error ? error.message : ''
        if (message.includes('401')) {
          logger.warn('[AUTH_REFRESH_401]')
          this.logout()
          return false
        }
        throw error
      }

      // Validar nuevo token
      if (!newToken || newToken.trim() === '') {
        logger.error('[AUTH_REFRESH_EMPTY_TOKEN]')
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
      logger.error('[AUTH_REFRESH_FAIL]')
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
      if (!this.googleSignIn.isReady()) {
        const errorMsg = 'Google Identity Services SDK no est?? cargado'
        logger.error('[AUTH_GSI_SDK_NOT_READY]')
        this.authState.error = 'SDK de Google no disponible'
        return
      }

      // Validar que el client_id esté configurado
      if (!this.GOOGLE_CLIENT_ID || this.GOOGLE_CLIENT_ID.trim() === '') {
        const errorMsg = 'client_id de Google no configurado'
        logger.error('[AUTH_CLIENT_ID_MISSING]')
        this.authState.error = 'Client ID no configurado'
        return
      }

      try {
        this.googleSignIn.initialize(
          this.GOOGLE_CLIENT_ID,
          (cred) => {
            try {
              callback(cred)
            } catch (callbackError) {
              logger.error('[AUTH_CALLBACK_FAIL]')
              this.authState.error = 'Error procesando autenticación'
            }
          },
          (error: any) => {
            logger.error('[AUTH_GSI_ORIGIN_NOT_ALLOWED]')
            const origin = this.runtimeEnv.getOrigin()
            this.authState.error = `Origen ${origin} no autorizado en Google Cloud Console. Ver consola para instrucciones.`
          }
        )
        
        // Monitorear errores de red de Google después de inicializar
        this.timer.setTimeout(() => {
          if (this.authState.error && this.authState.error.includes('no autorizado')) {
            logger.error('[AUTH_GSI_403]')
          }
        }, 2000)
      } catch (initError) {
        logger.error('[AUTH_GSI_INIT_FAIL]')
        throw initError
      }

      const container = this.documentQuery.getElementById(containerId)
      if (!container) {
        logger.error('[AUTH_GSI_CONTAINER_MISSING]')
        return
      }

      try {
        this.googleSignIn.renderButton(container)

        const stopObserving = this.performanceObserver.observeResourceEntries((entries) => {
          for (const entry of entries) {
            if (entry.name.includes('accounts.google.com') && entry.responseStatus === 403) {
              logger.error('[AUTH_GSI_403]')
            }
          }
        })
        
        // Verificar estado después de renderizar
        this.timer.setTimeout(() => {
          stopObserving()
          // Buscar iframes de Google en el DOM
          const googleIframes = this.documentQuery.querySelectorAll('iframe[src*=\"accounts.google.com\"], iframe[id*=\"gsi\"]')

          if (googleIframes.length === 0) {
            logger.error('[AUTH_GSI_DIAG_FAIL]')
          }
        }, 3000)
      } catch (renderError) {
        logger.error('[AUTH_GSI_RENDER_FAIL]')
        throw renderError
      }
    } catch (error) {
      logger.error('[AUTH_GSI_INIT_FAIL]')
      this.authState.error = 'Error de inicialización de Google Sign-In'
      throw error
    }
  }
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
