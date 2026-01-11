/**
 * Milestones Service
 * Maneja operaciones relacionadas con etapas/milestones del proyecto
 * Endpoints: GET /api/milestones, GET /api/milestones/:id
 */

import { apiClient } from '@/infrastructure/api'
import { Logger } from '@/infrastructure/logger'
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
      Logger.error('Error obteniendo milestones', error)
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
      console.error(`Error fetching milestone ${id}:`, error)
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
      console.error(`Error fetching evidences for milestone ${milestoneId}:`, error)
      throw error
    }
  }
}
