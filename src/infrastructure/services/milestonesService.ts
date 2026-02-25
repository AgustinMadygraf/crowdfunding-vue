/**
 * Milestones Service
 * Maneja operaciones relacionadas con etapas/milestones del proyecto
 * Endpoints: GET /api/milestones, GET /api/milestones/:id
 */

import { apiClient } from '@/infrastructure/api'
import { logger } from '@/infrastructure/logging/logger'

import type { MilestoneDTO, EvidenceDTO, ListResponse } from '@/infrastructure/dto'

export const milestonesService = {
  /**
   * Obtiene todas las etapas publicadas
   * GET /api/milestones
   */
  async getAll(): Promise<MilestoneDTO[]> {
    try {
      const response = await apiClient.get<ListResponse<MilestoneDTO>>('/api/milestones')
      return response.data
    } catch (error) {
      logger.event('error', {
        code: 'MILESTONES_SERVICE_GET_ALL_FAILED',
        context: 'Error obteniendo milestones'
      })
      throw error
    }
  },

  /**
   * Obtiene detalle de una etapa específica con evidencias
   * GET /api/milestones/:id
   */
  async getById(id: number): Promise<MilestoneDTO & { evidences: EvidenceDTO[] }> {
    try {
      return await apiClient.get<MilestoneDTO & { evidences: EvidenceDTO[] }>(
        `/api/milestones/${id}`
      )
    } catch (error) {
      logger.event('error', {
        code: 'MILESTONES_SERVICE_GET_BY_ID_FAILED',
        context: `Error fetching milestone ${id}`,
        safeDetails: { id }
      })
      throw error
    }
  },

  /**
   * Obtiene evidencias de una etapa específica
   * GET /api/milestones/:id/evidences
   */
  async getEvidences(milestoneId: number): Promise<EvidenceDTO[]> {
    try {
      const response = await apiClient.get<ListResponse<EvidenceDTO>>(
        `/api/milestones/${milestoneId}/evidences`
      )
      return response.data
    } catch (error) {
      logger.event('error', {
        code: 'MILESTONES_SERVICE_GET_EVIDENCES_FAILED',
        context: `Error fetching evidences for milestone ${milestoneId}`,
        safeDetails: { milestoneId }
      })
      throw error
    }
  }
}
