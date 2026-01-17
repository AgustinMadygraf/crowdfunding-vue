/**
 * Repository: Updates (Actualizaciones)
 * Encapsula toda la lógica de acceso a datos de actualizaciones
 */

import type { UpdateDTO } from '@/infrastructure/dto'
import { getAppConfig } from '@/config/appConfig'

export interface GetUpdatesParams {
  category?: string
  limit?: number
}

/**
 * Excepción personalizada para errores del repositorio
 */
export class UpdateRepositoryError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message)
    this.name = 'UpdateRepositoryError'
  }
}

/**
 * Repository de actualizaciones
 * Abstrae la lógica de acceso al backend
 */
export class UpdatesRepository {
  private readonly apiBaseUrl: string

  constructor(apiBaseUrl?: string) {
    this.apiBaseUrl = apiBaseUrl || getAppConfig().apiBaseUrl
  }

  /**
   * Obtiene todas las actualizaciones publicadas
   */
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
        let errorData: any = {}
        try {
          errorData = await response.json()
        } catch {
          const text = await response.text()
          errorData = { message: text || response.statusText }
        }

        console.error('[UpdatesRepository] ❌ Error HTTP', response.status)
        console.error('[UpdatesRepository] Respuesta:', errorData)

        throw new UpdateRepositoryError(
          errorData.message || `HTTP ${response.status}`,
          response.status,
          errorData
        )
      }

      const data = await response.json()

      // Normalizar respuesta: aceptar array directo o {data: [...]}
      const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : null

      if (!list) {
        console.error('[UpdatesRepository] ❌ Formato de respuesta inválido:', data)
        throw new UpdateRepositoryError('Formato de respuesta inválido para updates')
      }
      return list
    } catch (error) {
      if (error instanceof UpdateRepositoryError) {
        throw error
      }

      console.error('[UpdatesRepository] ❌ Error de conexión:', error)
      throw new UpdateRepositoryError(
        `No se pudo conectar: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        undefined,
        error
      )
    }
  }

  /**
   * Obtiene una actualización específica por ID
   */
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
          throw new UpdateRepositoryError('Actualización no encontrada', 404)
        }

        throw new UpdateRepositoryError(
          `Error al obtener update: HTTP ${response.status}`,
          response.status
        )
      }

      const update: UpdateDTO = await response.json()

      return update
    } catch (error) {
      if (error instanceof UpdateRepositoryError) {
        throw error
      }

      console.error('[UpdatesRepository] ❌ Error al obtener update:', error)
      throw new UpdateRepositoryError(
        error instanceof Error ? error.message : 'Error desconocido'
      )
    }
  }
}

// Instancia singleton por conveniencia
export const updatesRepository = new UpdatesRepository()
