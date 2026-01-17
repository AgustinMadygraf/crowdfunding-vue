/*
  Path: src/application/useSubscription.ts
 */

import { ref, computed } from 'vue'
import type { UserContribution } from '@/application/ports/ContributionsRepository'
import { getContributionsRepository } from '@/application/ports/contributionsRepositoryProvider'
import { CreateContributionUseCase } from '@/application/usecases/CreateContributionUseCase'
import { GetContributionByTokenUseCase } from '@/application/usecases/GetContributionByTokenUseCase'
import { ListUserContributionsUseCase } from '@/application/usecases/ListUserContributionsUseCase'
import { mapContributionError } from '@/application/errors/contributionErrorMapper'


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
  const createContributionUseCase = new CreateContributionUseCase(contributionsRepository)
  const getContributionByTokenUseCase = new GetContributionByTokenUseCase(contributionsRepository)
  const listUserContributionsUseCase = new ListUserContributionsUseCase(contributionsRepository)
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

    try {
      const resultToken = await createContributionUseCase.execute(data)
      token.value = resultToken
      return resultToken
    } catch (err) {
      console.error('[useSubscription] Error al crear contribucion:', err)
      error.value = mapContributionError(err)
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
      error.value = 'Token de contribucion invalido o vacio'
      return null
    }

    isLoading.value = true
    error.value = null

    try {
      if (import.meta.env.DEV) {
      }

      const result = await getContributionByTokenUseCase.execute(contributionToken)
      contribution.value = result
      token.value = contributionToken

      if (import.meta.env.DEV) {
      }
      return result
    } catch (err) {
      console.error('[useSubscription] Error al cargar contribucion:', err)
      error.value = mapContributionError(err)
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
      const list = await listUserContributionsUseCase.execute(userId)
      return list
    } catch (err) {
      console.error('[useSubscription] Error al cargar contribuciones:', err)
      error.value = mapContributionError(err)
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
