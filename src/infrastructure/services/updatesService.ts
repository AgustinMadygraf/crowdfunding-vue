/**
 * Updates Service
 * Maneja operaciones relacionadas con posts/actualizaciones del proyecto
 * Endpoints: GET /api/updates
 */

import { apiClient } from '@/infrastructure/api'
import type { UpdateDTO, ListResponse } from '@/infrastructure/dto'

export const updatesService = {
  /**
   * Obtiene todas las actualizaciones publicadas
   * GET /api/updates
   */
  async getAll(params?: { category?: string; limit?: number }): Promise<UpdateDTO[]> {
    try {
      const queryParams: Record<string, string> = {}
      if (params?.category) queryParams.category = params.category
      if (params?.limit) queryParams.limit = String(params.limit)

      const response = await apiClient.get<ListResponse<UpdateDTO>>('/api/updates', queryParams)
      return response.data
    } catch (error) {
      console.error('Error fetching updates:', error)
      throw error
    }
  },

  /**
   * Obtiene una actualización específica por ID
   * GET /api/updates/:id
   */
  async getById(id: number): Promise<UpdateDTO> {
    try {
      return await apiClient.get<UpdateDTO>(`/api/updates/${id}`)
    } catch (error) {
      console.error(`Error fetching update ${id}:`, error)
      throw error
    }
  }
}
