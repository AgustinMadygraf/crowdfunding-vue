/*
  Path: src/application/useSubscription.ts
 */

import { ref, computed } from 'vue'
import type {
  UserContribution,
  CreateContributionInput
} from '@/application/ports/ContributionsRepository'
import { getContributionsRepository } from '@/application/ports/contributionsRepositoryProvider'
import { CreateContributionUseCase } from '@/application/usecases/CreateContributionUseCase'
import { GetContributionByTokenUseCase } from '@/application/usecases/GetContributionByTokenUseCase'
import { ListUserContributionsUseCase } from '@/application/usecases/ListUserContributionsUseCase'
import { mapContributionError } from '@/application/errors/contributionErrorMapper'
import { logger } from '@/infrastructure/logging/logger'


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

  const logError = (context: string, err: unknown) => {
    logger.error(`[useSubscription] ${context}:`, err)
  }

  /**
   * Crea una nueva contribución
   */
  const createContribution = async (data: CreateContributionInput): Promise<string> => {
    isLoading.value = true
    error.value = null

    try {
      const resultToken = await createContributionUseCase.execute(data)
      token.value = resultToken
      return resultToken
    } catch (err: unknown) {
      logError('Error al crear contribucion', err)
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
      const result = await getContributionByTokenUseCase.execute(contributionToken)
      contribution.value = result
      token.value = contributionToken
      return result
    } catch (err: unknown) {
      logError('Error al cargar contribucion', err)
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
    } catch (err: unknown) {
      logError('Error al cargar contribuciones', err)
      error.value = mapContributionError(err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Limpia el estado
   */
  const reset = (): void => {
    contribution.value = null
    token.value = null
    error.value = null
    isLoading.value = false
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
