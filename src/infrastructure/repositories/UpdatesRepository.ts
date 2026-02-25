import type { UpdateDTO } from '@/infrastructure/dto'
import { getAppConfig } from '@/config/appConfig'
import { logger } from '@/infrastructure/logging/logger'

export interface GetUpdatesParams {
  category?: string
  limit?: number
}

export class UpdateRepositoryError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message)
    this.name = 'UpdateRepositoryError'
  }
}

export class UpdatesRepository {
  private readonly apiBaseUrl: string

  constructor(apiBaseUrl?: string) {
    this.apiBaseUrl = apiBaseUrl || getAppConfig().apiBaseUrl
  }

  private extractErrorMessage(errorData: unknown): string | null {
    if (typeof errorData === 'string' && errorData.trim()) return errorData

    if (errorData && typeof errorData === 'object' && 'message' in errorData) {
      const value = (errorData as { message?: unknown }).message
      if (typeof value === 'string' && value.trim()) return value
    }

    return null
  }

  async getAll(params?: GetUpdatesParams): Promise<UpdateDTO[]> {
    const queryParams = new URLSearchParams()
    if (params?.category) queryParams.set('category', params.category)
    if (params?.limit) queryParams.set('limit', String(params.limit))

    const queryString = queryParams.toString()
    const url = `${this.apiBaseUrl}/api/updates${queryString ? `?${queryString}` : ''}`

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        let errorData: unknown = {}
        try {
          errorData = await response.json()
        } catch {
          const text = await response.text()
          errorData = { message: text || response.statusText }
        }

        logger.event('error', {
          code: 'UPDATE_REPO_HTTP_ERROR',
          context: 'Error HTTP al obtener updates',
          safeDetails: { status: response.status }
        })

        throw new UpdateRepositoryError(
          this.extractErrorMessage(errorData) || `HTTP ${response.status}`,
          response.status,
          errorData
        )
      }

      const data = await response.json()
      const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : null

      if (!list) {
        logger.event('error', {
          code: 'UPDATE_REPO_INVALID_FORMAT',
          context: 'Formato de respuesta invalido para updates'
        })
        throw new UpdateRepositoryError('Formato de respuesta invalido para updates')
      }
      return list
    } catch (error) {
      if (error instanceof UpdateRepositoryError) throw error

      logger.event('error', {
        code: 'UPDATE_REPO_CONNECTION_ERROR',
        context: 'Error de conexion al obtener updates'
      })

      throw new UpdateRepositoryError(
        `No se pudo conectar: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        undefined,
        error
      )
    }
  }

  async getById(id: number): Promise<UpdateDTO> {
    const url = `${this.apiBaseUrl}/api/updates/${id}`

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new UpdateRepositoryError('Actualizacion no encontrada', 404)
        }

        throw new UpdateRepositoryError(
          `Error al obtener update: HTTP ${response.status}`,
          response.status
        )
      }

      const update: UpdateDTO = await response.json()

      return update
    } catch (error) {
      if (error instanceof UpdateRepositoryError) throw error

      logger.event('error', {
        code: 'UPDATE_REPO_GET_BY_ID_ERROR',
        context: 'Error al obtener update por ID',
        safeDetails: { id }
      })

      throw new UpdateRepositoryError(
        error instanceof Error ? error.message : 'Error desconocido'
      )
    }
  }
}

export const updatesRepository = new UpdatesRepository()
