/**
 * Documents Service
 * Maneja operaciones relacionadas con documentos públicos
 * Endpoints: GET /api/documents
 */

import { apiClient } from '@/infrastructure/api'
import { Logger } from '@/infrastructure/logger'
import type { DocumentDTO, ListResponse } from '@/infrastructure/dto'

export const documentsService = {
  /**
   * Obtiene todos los documentos publicados
   * GET /api/documents
   */
  async getAll(params?: { category?: string }): Promise<DocumentDTO[]> {
    try {
      const queryParams: Record<string, string> = {}
      if (params?.category) queryParams.category = params.category

      const response = await apiClient.get<ListResponse<DocumentDTO>>('/api/documents', queryParams)
      return response.data
    } catch (error) {
      Logger.error('Error obteniendo documentos', error)
      throw error
    }
  },

  /**
   * Obtiene un documento específico por ID
   * GET /api/documents/:id
   */
  async getById(id: number): Promise<DocumentDTO> {
    try {
      return await apiClient.get<DocumentDTO>(`/api/documents/${id}`)
    } catch (error) {
      console.error(`Error fetching document ${id}:`, error)
      throw error
    }
  }
}
