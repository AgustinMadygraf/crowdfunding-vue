/**
 * Subscriptions Service
 * Maneja operaciones de suscripción y leads
 * Endpoints: POST /api/subscriptions, GET /api/subscriptions/:id
 */

import { apiClient } from '@/infrastructure/api'
import { logger } from '@/infrastructure/logging/logger'

import type {
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
  GetSubscriptionResponse
} from '@/infrastructure/dto'

export const subscriptionsService = {
  /**
   * Crea una nueva suscripción (pre-registro + inicio)
   * POST /api/subscriptions
   */
  async create(data: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse> {
    try {
      return await apiClient.post<CreateSubscriptionResponse>('/api/subscriptions', data)
    } catch (error) {
      logger.event('error', {
        code: 'SUBSCRIPTIONS_SERVICE_CREATE_FAILED',
        context: 'Error creating subscription',
        safeDetails: { hasLead: !!data?.lead, hasConsent: !!data?.consent }
      })
      throw error
    }
  },

  /**
   * Obtiene el estado de una suscripción
   * GET /api/subscriptions/:id
   */
  async getStatus(subscriptionId: string): Promise<GetSubscriptionResponse> {
    try {
      return await apiClient.get<GetSubscriptionResponse>(`/api/subscriptions/${subscriptionId}`)
    } catch (error) {
      logger.event('error', {
        code: 'SUBSCRIPTIONS_SERVICE_GET_STATUS_FAILED',
        context: 'Error obteniendo suscripción',
        safeDetails: { subscriptionId }
      })
      throw error
    }
  }
}
