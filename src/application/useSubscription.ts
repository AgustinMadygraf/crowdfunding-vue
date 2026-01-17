/**
 * Composable para gestionar contribuciones/suscripciones
 * Centraliza lógica de creación, carga y manejo de errores
 */

import { ref, computed, type Ref } from 'vue'
import {
  ContributionRepositoryError,
  type UserContribution
} from '@/application/ports/ContributionsRepository'
import { getContributionsRepository } from '@/application/ports/contributionsRepositoryProvider'
import type { User } from '@/domain/user'


export interface CreateContributionData {
  user_id: string
  monto: number
  nivel_id: string
  nivel_nombre: string
  utm_params?: Record<string, string>
}

export interface ContributionState {
  contribution: UserContribution | null
  token: string | null
  isLoading: boolean
  error: string | null
}

export function useSubscription() {
  const contributionsRepository = getContributionsRepository()
  // Estado reactivo
  const contribution = ref<UserContribution | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Estado computado
  const hasContribution = computed(() => !!contribution.value)
  const hasError = computed(() => !!error.value)

  /**
   * Crea una nueva contribución
   */
  const createContribution = async (data: CreateContributionData): Promise<string> => {
    isLoading.value = true
    error.value = null

    try {      const result = await contributionsRepository.create({
        user_id: data.user_id,
        monto: data.monto,
        nivel_id: data.nivel_id,
        nivel_nombre: data.nivel_nombre,
        utm_params: data.utm_params || {}
      })
      
      // El repositorio devuelve ContributionResponse con token, no UserContribution completa
      token.value = result.token
      return result.token
    } catch (err) {
      console.error('[useSubscription] ❌ Error al crear contribución:', err)
      
      if (err instanceof ContributionRepositoryError) {
        // Mensajes de error amigables según código HTTP
        if (err.statusCode === 401) {
          error.value = 'Sesión expirada. Por favor, cerrá sesión y volvé a ingresar.'
        } else if (err.statusCode === 403) {
          error.value = 'No tenés permisos para realizar esta acción.'
        } else if (err.statusCode && err.statusCode >= 500) {
          error.value = 'Error del servidor. Por favor, intentá de nuevo más tarde.'
        } else {
          error.value = err.message || 'Error al crear contribución'
        }
      } else {
        error.value = err instanceof Error ? err.message : 'Error desconocido al procesar tu contribución'
      }
      
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Carga una contribución existente por token
   */
  const loadContributionByToken = async (contributionToken: string): Promise<UserContribution | null> => {
    // Validar token antes de fetch
    if (!contributionToken?.trim()) {
      error.value = 'Token de contribución inválido o vacío'
      return null
    }

    isLoading.value = true
    error.value = null

    try {
      if (import.meta.env.DEV) {
      }

      const result = await contributionsRepository.getByToken(contributionToken)
      contribution.value = result
      token.value = contributionToken

      if (import.meta.env.DEV) {
      }
      return result
    } catch (err) {
      console.error('[useSubscription] ❌ Error al cargar contribución:', err)
      
      if (err instanceof ContributionRepositoryError) {
        if (err.statusCode === 404) {
          error.value = 'No se encontró la contribución'
        } else if (err.statusCode === 401) {
          error.value = 'Sesión expirada'
        } else {
          error.value = err.message || 'Error al cargar contribución'
        }
      } else {
        error.value = err instanceof Error ? err.message : 'Error desconocido'
      }
      
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Carga todas las contribuciones de un usuario
   */
  const loadUserContributions = async (userId: string): Promise<UserContribution[]> => {
    isLoading.value = true
    error.value = null

    try {
      const list = await contributionsRepository.getByUserId(userId)
      return list
    } catch (err) {
      console.error('[useSubscription] ❌ Error al cargar contribuciones:', err)
      
      if (err instanceof ContributionRepositoryError) {
        if (err.statusCode === 404) {
          error.value = 'No se encontraron contribuciones'
        } else if (err.statusCode === 401) {
          error.value = 'Sesión expirada'
        } else {
          error.value = err.message || 'Error al cargar contribuciones'
        }
      } else {
        error.value = err instanceof Error ? err.message : 'Error desconocido'
      }
      
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Limpia el estado
   */
  const reset = () => {
    contribution.value = null
    token.value = null
    error.value = null
    isLoading.value = false
  }

  /**
   * Fetch subscription data
   */
  async function fetchSubscription() {
    try {
      // ...existing code...
    } catch (error) {
      console.error('Error fetching subscription', error)
      throw error
    }
  }

  return {
    // Estado
    contribution,
    token,
    isLoading,
    error,
    hasContribution,
    hasError,
    
    // Acciones
    createContribution,
    loadContributionByToken,
    loadUserContributions,
    reset
  }
}
