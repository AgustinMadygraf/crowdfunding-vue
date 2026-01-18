/**
 * HttpClient - Cliente HTTP mejorado con validación y manejo de errores
 * Responsabilidad única: ejecutar requests HTTP con retry, timeout y validación
 * 
 * Principios SOLID:
 * - Single Responsibility: solo manejo de HTTP
 * - Open/Closed: extensible mediante ResponseValidator y ApiConfig
 * - Dependency Inversion: depende de abstracciones (ApiConfig, ResponseValidator)
 * 
 * @module HttpClient
 */

import type { ApiConfig } from './ApiConfig'
import { ResponseValidator, ResponseValidationError } from './ResponseValidator'

export interface HttpClientOptions {
  config: ApiConfig
  validator?: ResponseValidator
  additionalHeaders?: Record<string, string>
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  body?: unknown
  credentials?: RequestCredentials
  skipValidation?: boolean
}

export interface HttpError {
  status: number
  message: string
  url: string
  requestId?: string
  errors?: Record<string, string[]>
  timestamp: string
}

export class HttpClientError extends Error {
  constructor(
    public readonly httpError: HttpError,
    public readonly originalError?: Error
  ) {
    super(httpError.message)
    this.name = 'HttpClientError'
    
    if ((Error as any).captureStackTrace) {
      (Error as any).captureStackTrace(this, HttpClientError)
    }
  }
}

/**
 * Cliente HTTP con manejo de errores, retry y validación
 */
export class HttpClient {
  private readonly config: ApiConfig
  private readonly validator: ResponseValidator
  private readonly additionalHeaders: Record<string, string>

  constructor(options: HttpClientOptions) {
    this.config = options.config
    this.validator = options.validator || new ResponseValidator('application/json')
    this.additionalHeaders = options.additionalHeaders || {}
  }

  /**
   * Ejecuta un GET request
   */
  async get<T>(path: string, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' })
  }

  /**
   * Ejecuta un POST request
   */
  async post<T>(path: string, body: unknown, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'POST', body })
  }

  /**
   * Ejecuta un PUT request
   */
  async put<T>(path: string, body: unknown, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'PUT', body })
  }

  /**
   * Ejecuta un PATCH request
   */
  async patch<T>(path: string, body: unknown, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'PATCH', body })
  }

  /**
   * Ejecuta un DELETE request
   */
  async delete<T>(path: string, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' })
  }

  /**
   * Ejecuta un request HTTP con retry y validación
   */
  private async request<T>(path: string, options: RequestOptions): Promise<T> {
    const url = this.config.buildUrl(path)
    const requestId = this.generateRequestId()
    
    // Retry con backoff exponencial
    return this.retryWithBackoff(
      () => this.executeRequest<T>(url, requestId, options),
      this.config.retryAttempts
    )
  }

  /**
   * Ejecuta una request individual
   */
  private async executeRequest<T>(
    url: string,
    requestId: string,
    options: RequestOptions
  ): Promise<T> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), this.config.timeout)

    try {
      const headers = this.buildHeaders(requestId, options.headers)
      const init: RequestInit = {
        method: options.method || 'GET',
        headers,
        credentials: options.credentials || 'include',
        signal: controller.signal
      }

      // Agregar body solo para métodos que lo soportan
      if (options.body && ['POST', 'PUT', 'PATCH'].includes(init.method || '')) {
        init.body = JSON.stringify(options.body)
      }

      const response = await fetch(url, init)

      // Validar content-type si no se saltea la validación
      if (!options.skipValidation) {
        await this.validator.validate(response, url, requestId)
      }

      // Manejar errores HTTP
      if (!response.ok) {
        throw await this.buildHttpError(response, url, requestId)
      }

      // Manejar 204 No Content
      if (response.status === 204) {
        return null as T
      }

      return await response.json()
    } catch (error) {
      // Re-lanzar errores conocidos
      if (error instanceof ResponseValidationError || error instanceof HttpClientError) {
        throw error
      }

      // Manejar timeout
      if (error instanceof Error && error.name === 'AbortError') {
        throw new HttpClientError({
          status: 0,
          message: `Timeout después de ${this.config.timeout}ms`,
          url,
          requestId,
          timestamp: new Date().toISOString()
        })
      }

      // Manejar errores de red
      throw new HttpClientError(
        {
          status: 0,
          message: `Error de red: ${error instanceof Error ? error.message : 'Error desconocido'}`,
          url,
          requestId,
          timestamp: new Date().toISOString()
        },
        error instanceof Error ? error : undefined
      )
    } finally {
      clearTimeout(timeout)
    }
  }

  /**
   * Construye headers para la request
   */
  private buildHeaders(requestId: string, customHeaders?: Record<string, string>): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Request-Id': requestId,
      ...this.additionalHeaders,
      ...customHeaders
    }

    // Agregar header para saltar warning de ngrok si está configurado
    if (this.config.skipNgrokWarning && this.config.isNgrokUrl()) {
      headers['ngrok-skip-browser-warning'] = 'true'
      
      if (import.meta.env.DEV) {
        console.log('[HttpClient] Added ngrok-skip-browser-warning header')
      }
    }

    return headers
  }

  /**
   * Construye un HttpError desde una respuesta fallida
   */
  private async buildHttpError(response: Response, url: string, requestId: string): Promise<HttpClientError> {
    let errorData: any = {}
    
    try {
      errorData = await response.json()
    } catch {
      const text = await response.text().catch(() => '')
      errorData = { message: text || response.statusText }
    }

    const httpError: HttpError = {
      status: response.status,
      message: errorData.message || errorData.error || response.statusText || `HTTP ${response.status}`,
      url,
      requestId,
      errors: errorData.errors,
      timestamp: new Date().toISOString()
    }

    return new HttpClientError(httpError)
  }

  /**
   * Reintenta una operación con backoff exponencial
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxAttempts: number
  ): Promise<T> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        // No reintentar en estos casos:
        // - Último intento
        // - Errores de validación (content-type incorrecto)
        // - Errores 4xx (cliente)
        const shouldNotRetry =
          attempt === maxAttempts - 1 ||
          error instanceof ResponseValidationError ||
          (error instanceof HttpClientError && error.httpError.status >= 400 && error.httpError.status < 500)

        if (shouldNotRetry) {
          throw error
        }

        // Backoff exponencial: 1s, 2s, 4s
        const delayMs = Math.pow(2, attempt) * 1000
        
        if (import.meta.env.DEV) {
          console.log(`[HttpClient] Retry ${attempt + 1}/${maxAttempts}, waiting ${delayMs}ms...`)
        }
        
        await this.delay(delayMs)
      }
    }

    throw lastError || new Error('Retry exhausted')
  }

  /**
   * Genera un ID único para la request
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/**
 * Factory para crear HttpClient con configuración específica
 */
export const createHttpClient = (options: HttpClientOptions): HttpClient => {
  return new HttpClient(options)
}
