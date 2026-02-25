import type { MilestoneDTO, EvidenceDTO } from '@/infrastructure/dto'
import { getAppConfig } from '@/config/appConfig'
import { logger } from '@/infrastructure/logging/logger'

export interface MilestoneWithEvidences extends MilestoneDTO {
  evidences: EvidenceDTO[]
}

export class MilestoneRepositoryError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message)
    this.name = 'MilestoneRepositoryError'
  }
}

export class MilestonesRepository {
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

  async getAll(): Promise<MilestoneDTO[]> {
    const url = `${this.apiBaseUrl}/api/milestones`

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
          code: 'MILESTONE_REPO_HTTP_ERROR',
          context: 'Error HTTP al obtener milestones',
          safeDetails: { status: response.status }
        })

        throw new MilestoneRepositoryError(
          this.extractErrorMessage(errorData) || `HTTP ${response.status}`,
          response.status,
          errorData
        )
      }

      const data = await response.json()
      const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : null

      if (!list) {
        logger.event('error', {
          code: 'MILESTONE_REPO_INVALID_FORMAT',
          context: 'Formato de respuesta invalido para milestones'
        })
        throw new MilestoneRepositoryError('Formato de respuesta invalido para milestones')
      }

      return list
    } catch (error) {
      if (error instanceof MilestoneRepositoryError) throw error

      logger.event('error', {
        code: 'MILESTONE_REPO_CONNECTION_ERROR',
        context: 'Error de conexion al obtener milestones'
      })

      throw new MilestoneRepositoryError(
        `No se pudo conectar: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        undefined,
        error
      )
    }
  }

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
      if (error instanceof MilestoneRepositoryError) throw error

      logger.event('error', {
        code: 'MILESTONE_REPO_GET_BY_ID_ERROR',
        context: 'Error al obtener milestone por ID',
        safeDetails: { id }
      })

      throw new MilestoneRepositoryError(
        error instanceof Error ? error.message : 'Error desconocido'
      )
    }
  }

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
      const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : null

      if (!list) {
        logger.event('error', {
          code: 'MILESTONE_REPO_INVALID_EVIDENCE_FORMAT',
          context: 'Formato de respuesta invalido para evidencias',
          safeDetails: { milestoneId }
        })
        throw new MilestoneRepositoryError('Formato de respuesta invalido para evidencias')
      }

      return list
    } catch (error) {
      if (error instanceof MilestoneRepositoryError) throw error

      logger.event('error', {
        code: 'MILESTONE_REPO_GET_EVIDENCES_ERROR',
        context: 'Error al obtener evidencias',
        safeDetails: { milestoneId }
      })

      throw new MilestoneRepositoryError(
        error instanceof Error ? error.message : 'Error desconocido'
      )
    }
  }
}

export const milestonesRepository = new MilestonesRepository()
