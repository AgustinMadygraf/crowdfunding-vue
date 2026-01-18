/*
Path: src/infrastructure/repositories/ContributionsRepository.ts
Refactored to use new HttpClient with response validation
*/

import type {
  ContributionsRepositoryPort,
  CreateContributionDTO,
  ContributionResponse,
  UserContribution
} from '@/application/ports/ContributionsRepository'
import { ContributionRepositoryError } from '@/application/ports/ContributionsRepository'
import { authService } from '@/infrastructure/services/authServiceFactory'
import { csrfService } from '@/infrastructure/services/csrfService'
import { HttpClient, HttpClientError, getApiConfig, ResponseValidationError } from '@/infrastructure/http'
import type { ApiConfig } from '@/infrastructure/http'

export class ContributionsRepository implements ContributionsRepositoryPort {
  private readonly httpClient: HttpClient
  private readonly config: ApiConfig
  private readonly debugHttp: boolean

  constructor(apiConfig?: ApiConfig) {
    this.config = apiConfig || getApiConfig()
    this.debugHttp = import.meta.env.VITE_DEBUG_HTTP === 'true'
    
    // Crear cliente HTTP con headers de autenticación
    this.httpClient = new HttpClient({
      config: this.config,
      additionalHeaders: this.buildAdditionalHeaders()
    })

    if (import.meta.env.DEV) {
      this.pingHealth().catch(() => {})
    }
  }

  /**
   * Construye headers adicionales (auth, CSRF)
   */
  private buildAdditionalHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      ...authService.getAuthHeaders()
    }

    const csrfToken = csrfService.getToken()
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken
    }

    const jwt = authService.getAuthToken()
    if (jwt) {
      headers['Authorization'] = `Bearer ${jwt}`
    }

    return headers
  }

  private async pingHealth(): Promise<void> {
    try {
      await this.httpClient.get(this.config.health())
      if (this.debugHttp) {
        console.log('[ContributionsRepository] Health check OK')
      }
    } catch (error) {
      console.warn('[ContributionsRepository] Health check failed:', error)
    }
  }

  /**
   * Crea una nueva contribución
   */
  async create(data: CreateContributionDTO): Promise<ContributionResponse> {
    // Refrescar token si es necesario antes de la operación
    await authService.refreshTokenIfNeeded()

    try {
      const result = await this.httpClient.post<ContributionResponse>(
        this.config.contributions(),
        data
      )
      
      return result
    } catch (error) {
      throw this.mapError(error, 'create')
    }
  }

  /**
   * Obtiene las contribuciones de un usuario
   */
  async getByUserId(userId: string): Promise<UserContribution[]> {
    try {
      const data = await this.httpClient.get<UserContribution[] | { contributions: UserContribution[] } | { items: UserContribution[] }>(
        this.config.userContributions(userId)
      )

      // Normalizar respuesta: aceptar array directo, {contributions: [...]} o {items: [...]}
      const list = Array.isArray(data)
        ? data
        : 'contributions' in data && Array.isArray(data.contributions)
          ? data.contributions
          : 'items' in data && Array.isArray(data.items)
            ? data.items
            : null

      if (!list) {
        console.error('[ContributionsRepository] ❌ Formato de respuesta inválido:', data)
        throw new ContributionRepositoryError('Formato de respuesta inválido para contribuciones')
      }
      
      return list
    } catch (error) {
      throw this.mapError(error, 'getByUserId')
    }
  }

  /**
   * Obtiene una contribución por su token
   */
  async getByToken(token: string): Promise<UserContribution> {
    // Refrescar token si es necesario antes de la operación
    await authService.refreshTokenIfNeeded()
    
    // Validar token antes de fetch
    if (!token?.trim()) {
      throw new ContributionRepositoryError('Token de contribución inválido o vacío')
    }

    try {
      const contribution = await this.httpClient.get<UserContribution>(
        this.config.contributions(token)
      )
      
      return contribution
    } catch (error) {
      throw this.mapError(error, 'getByToken', { token })
    }
  }

  /**
   * Mapea errores del HttpClient a ContributionRepositoryError
   */
  private mapError(error: unknown, operation: string, context?: Record<string, unknown>): ContributionRepositoryError {
    // Error de validación de respuesta (HTML en lugar de JSON)
    if (error instanceof ResponseValidationError) {
      const { details, message } = error.validationError
      
      console.error('[ContributionsRepository] 🚨 Validation error:', {
        operation,
        ...details,
        ...context
      })

      // Mensaje específico para el usuario
      let userMessage = message
      
      if (details.contentType.includes('text/html')) {
        if (message.includes('ngrok')) {
          userMessage = 'Error de configuración: ngrok requiere header adicional. Contacta al equipo técnico.'
        } else if (message.includes('404')) {
          userMessage = 'El endpoint solicitado no existe. Verifica la configuración de la API.'
        } else {
          userMessage = 'Error de configuración del servidor. El endpoint devolvió HTML en lugar de datos JSON.'
        }
      }

      return new ContributionRepositoryError(
        userMessage,
        details.status,
        {
          operation,
          validationType: 'content_type',
          ...details,
          ...context
        }
      )
    }

    // Error HTTP (4xx, 5xx)
    if (error instanceof HttpClientError) {
      const { httpError } = error
      
      console.error('[ContributionsRepository] ❌ HTTP error:', {
        operation,
        ...httpError,
        ...context
      })

      return new ContributionRepositoryError(
        httpError.message,
        httpError.status,
        {
          operation,
          ...httpError,
          ...context
        }
      )
    }

    // Error desconocido
    const errMsg = error instanceof Error ? error.message : 'Error desconocido'
    console.error('[ContributionsRepository] ❌ Unexpected error:', {
      operation,
      error: errMsg,
      ...context
    })
    
    return new ContributionRepositoryError(
      `Error inesperado en operación ${operation}: ${errMsg}`,
      undefined,
      { operation, originalError: error, ...context }
    )
  }
}

// Instancia singleton por conveniencia (se puede inyectar después)
export const contributionsRepository = new ContributionsRepository()
