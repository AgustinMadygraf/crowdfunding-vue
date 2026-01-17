/**
 * Repository: Milestones (Etapas)
 * Encapsula toda la lógica de acceso a datos de milestones
 */

import type { MilestoneDTO, EvidenceDTO } from '@/infrastructure/dto'
import { getApiBaseUrl } from '@/config/api'

export interface MilestoneWithEvidences extends MilestoneDTO {
  evidences: EvidenceDTO[]
}

/**
 * Excepción personalizada para errores del repositorio
 */
export class MilestoneRepositoryError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message)
    this.name = 'MilestoneRepositoryError'
  }
}

/**
 * Repository de milestones
 * Abstrae la lógica de acceso al backend
 */
export class MilestonesRepository {
  private readonly apiBaseUrl: string

  constructor(apiBaseUrl?: string) {
    this.apiBaseUrl = apiBaseUrl || getApiBaseUrl()
  }

  /**
   * Obtiene todas las etapas publicadas
   */
  async getAll(): Promise<MilestoneDTO[]> {
    const url = `${this.apiBaseUrl}/api/milestones`

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

        console.error('[MilestonesRepository] ❌ Error HTTP', response.status)
        console.error('[MilestonesRepository] Respuesta:', errorData)

        throw new MilestoneRepositoryError(
          errorData.message || `HTTP ${response.status}`,
          response.status,
          errorData
        )
      }

      const data = await response.json()

      // Normalizar respuesta: aceptar array directo o {data: [...]}
      const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : null

      if (!list) {
        console.error('[MilestonesRepository] ❌ Formato de respuesta inválido:', data)
        throw new MilestoneRepositoryError('Formato de respuesta inválido para milestones')
      }
      return list
    } catch (error) {
      if (error instanceof MilestoneRepositoryError) {
        throw error
      }

      console.error('[MilestonesRepository] ❌ Error de conexión:', error)
      throw new MilestoneRepositoryError(
        `No se pudo conectar: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        undefined,
        error
      )
    }
  }

  /**
   * Obtiene detalle de una etapa específica con evidencias
   */
  async getById(id: number): Promise<MilestoneWithEvidences> {
    const url = `${this.apiBaseUrl}/api/milestones/${id}`

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new MilestoneRepositoryError('Milestone no encontrado', 404)
        }

        throw new MilestoneRepositoryError(
          `Error al obtener milestone: HTTP ${response.status}`,
          response.status
        )
      }

      const milestone: MilestoneWithEvidences = await response.json()

      return milestone
    } catch (error) {
      if (error instanceof MilestoneRepositoryError) {
        throw error
      }

      console.error('[MilestonesRepository] ❌ Error al obtener milestone:', error)
      throw new MilestoneRepositoryError(
        error instanceof Error ? error.message : 'Error desconocido'
      )
    }
  }

  /**
   * Obtiene evidencias de una etapa específica
   */
  async getEvidences(milestoneId: number): Promise<EvidenceDTO[]> {
    const url = `${this.apiBaseUrl}/api/milestones/${milestoneId}/evidences`

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new MilestoneRepositoryError(
          `Error al obtener evidencias: HTTP ${response.status}`,
          response.status
        )
      }

      const data = await response.json()

      // Normalizar respuesta: aceptar array directo o {data: [...]}
      const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : null

      if (!list) {
        console.error('[MilestonesRepository] ❌ Formato de respuesta inválido:', data)
        throw new MilestoneRepositoryError('Formato de respuesta inválido para evidencias')
      }
      return list
    } catch (error) {
      if (error instanceof MilestoneRepositoryError) {
        throw error
      }

      console.error('[MilestonesRepository] ❌ Error al obtener evidencias:', error)
      throw new MilestoneRepositoryError(
        error instanceof Error ? error.message : 'Error desconocido'
      )
    }
  }
}

// Instancia singleton por conveniencia
export const milestonesRepository = new MilestonesRepository()
