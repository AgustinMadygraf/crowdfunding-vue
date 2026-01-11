/**
 * Repository: Milestones (Etapas)
 * Encapsula toda la lógica de acceso a datos de milestones
 */

import type { MilestoneDTO, EvidenceDTO } from '@/infrastructure/dto'

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
    this.apiBaseUrl = apiBaseUrl || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
  }

  /**
   * Obtiene todas las etapas publicadas
   */
  async getAll(): Promise<MilestoneDTO[]> {
    const url = `${this.apiBaseUrl}/api/milestones`

    console.log('[MilestonesRepository] 📥 GET', url)

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

      console.log('[MilestonesRepository] ✅ Milestones obtenidos:', list.length)
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

    console.log('[MilestonesRepository] 📥 GET', url)

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
      console.log('[MilestonesRepository] ✅ Milestone obtenido:', milestone.id)

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

    console.log('[MilestonesRepository] 📥 GET', url)

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

      console.log('[MilestonesRepository] ✅ Evidencias obtenidas:', list.length)
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
