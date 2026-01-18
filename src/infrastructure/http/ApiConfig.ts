/**
 * ApiConfig - Configuración centralizada de URLs y prefijos
 * Responsabilidad única: gestionar configuración de API por entorno
 * 
 * Elimina la duplicación de strings de rutas y centraliza la lógica de construcción de URLs
 * 
 * @module ApiConfig
 */

export interface ApiEndpoints {
  readonly baseUrl: string
  readonly apiPrefix: string
  readonly timeout: number
  readonly retryAttempts: number
  readonly skipNgrokWarning: boolean
}

export interface ApiConfigOptions {
  baseUrl?: string
  apiPrefix?: string
  timeout?: number
  retryAttempts?: number
  skipNgrokWarning?: boolean
}

/**
 * Configuración de API con valores por entorno
 */
export class ApiConfig implements ApiEndpoints {
  readonly baseUrl: string
  readonly apiPrefix: string
  readonly timeout: number
  readonly retryAttempts: number
  readonly skipNgrokWarning: boolean

  private constructor(options: Required<ApiConfigOptions>) {
    this.baseUrl = this.normalizeUrl(options.baseUrl)
    this.apiPrefix = this.normalizePrefix(options.apiPrefix)
    this.timeout = options.timeout
    this.retryAttempts = options.retryAttempts
    this.skipNgrokWarning = options.skipNgrokWarning
  }

  /**
   * Factory method para crear configuración desde variables de entorno
   */
  static fromEnvironment(): ApiConfig {
    const isProduction = import.meta.env.PROD
    const isDevelopment = import.meta.env.DEV
    const baseUrl = this.resolveBaseUrl()
    
    // En desarrollo con ngrok, activar skip warning por defecto
    const isNgrok = baseUrl.includes('ngrok')
    const skipNgrokWarning = isDevelopment && isNgrok

    return new ApiConfig({
      baseUrl,
      apiPrefix: import.meta.env.VITE_API_PREFIX || '/api',
      timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '15000', 10),
      retryAttempts: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS || '3', 10),
      skipNgrokWarning
    })
  }

  /**
   * Factory method para crear configuración custom (útil para tests)
   */
  static create(options: ApiConfigOptions = {}): ApiConfig {
    const defaults: Required<ApiConfigOptions> = {
      baseUrl: 'http://localhost:5000',
      apiPrefix: '/api',
      timeout: 15000,
      retryAttempts: 3,
      skipNgrokWarning: false
    }

    return new ApiConfig({ ...defaults, ...options })
  }

  /**
   * Construye URL completa para un endpoint
   * @param path Ruta del endpoint (ej: '/contributions/123')
   * @returns URL completa (ej: 'https://api.com/api/contributions/123')
   */
  buildUrl(path: string): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    
    // Si el path ya incluye el prefijo, no duplicarlo
    if (normalizedPath.startsWith(this.apiPrefix)) {
      return `${this.baseUrl}${normalizedPath}`
    }
    
    return `${this.baseUrl}${this.apiPrefix}${normalizedPath}`
  }

  /**
   * Construye URL para recursos (endpoints específicos)
   */
  contributions(id?: string): string {
    return id ? this.buildUrl(`/contributions/${id}`) : this.buildUrl('/contributions')
  }

  userContributions(userId: string): string {
    return this.buildUrl(`/users/${userId}/contributions`)
  }

  health(): string {
    return this.buildUrl('/health')
  }

  auth(action: 'login' | 'logout' | 'refresh' | 'verify'): string {
    return this.buildUrl(`/auth/${action}`)
  }

  /**
   * Normaliza una URL removiendo trailing slash
   */
  private normalizeUrl(url: string): string {
    return url.replace(/\/$/, '')
  }

  /**
   * Normaliza un prefijo asegurando que empiece con / y no termine con /
   */
  private normalizePrefix(prefix: string): string {
    let normalized = prefix.trim()
    
    if (!normalized.startsWith('/')) {
      normalized = `/${normalized}`
    }
    
    if (normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1)
    }
    
    return normalized
  }

  /**
   * Resuelve la base URL desde variables de entorno
   */
  private static resolveBaseUrl(): string {
    const fromEnv = (import.meta.env.VITE_API_BASE_URL || '').trim()
    const isProd = import.meta.env.PROD

    if (fromEnv) {
      // Si es una ruta relativa, usar el origin del browser
      if (fromEnv.startsWith('/')) {
        if (typeof window === 'undefined') {
          throw new Error('VITE_API_BASE_URL con ruta relativa requiere window.location')
        }
        return `${window.location.origin}${fromEnv}`.replace(/\/$/, '')
      }
      return fromEnv.replace(/\/$/, '')
    }

    // En producción, la base URL es obligatoria
    if (isProd) {
      throw new Error(
        'VITE_API_BASE_URL no está definida. Define la variable al momento de build, ej: https://api.example.com'
      )
    }

    // En desarrollo, usar localhost por defecto
    if (typeof console !== 'undefined') {
      console.warn(
        '[ApiConfig] VITE_API_BASE_URL no configurada. Usando http://localhost:5000 (solo desarrollo)'
      )
    }
    
    return 'http://localhost:5000'
  }

  /**
   * Detecta si la base URL es de ngrok
   */
  isNgrokUrl(): boolean {
    return this.baseUrl.includes('ngrok')
  }

  /**
   * Retorna información de configuración para debugging
   */
  getDebugInfo(): Record<string, unknown> {
    return {
      baseUrl: this.baseUrl,
      apiPrefix: this.apiPrefix,
      timeout: this.timeout,
      retryAttempts: this.retryAttempts,
      skipNgrokWarning: this.skipNgrokWarning,
      isNgrok: this.isNgrokUrl(),
      environment: import.meta.env.MODE
    }
  }
}

/**
 * Instancia singleton de configuración
 * Se inicializa lazy al primer acceso
 */
let configInstance: ApiConfig | null = null

export const getApiConfig = (): ApiConfig => {
  if (!configInstance) {
    configInstance = ApiConfig.fromEnvironment()
    
    if (import.meta.env.DEV) {
      console.log('[ApiConfig] Initialized with:', configInstance.getDebugInfo())
    }
  }
  
  return configInstance
}

/**
 * Resetea la instancia singleton (útil para tests)
 */
export const resetApiConfig = (): void => {
  configInstance = null
}
