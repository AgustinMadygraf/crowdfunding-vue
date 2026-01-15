/*
Path: src/application/useMilestones.ts
*/

import { computed, ref, onMounted } from 'vue'
import type { Milestone } from '@/domain/milestone'
import { mockMilestones } from '@/infrastructure/mockData'
import { milestonesRepository, MilestoneRepositoryError } from '@/infrastructure/repositories/MilestonesRepository'
import type { MilestoneDTO } from '@/infrastructure/dto'
import { Logger } from '@/infrastructure/logger'

// Transforma un mock Milestone a modelo de dominio Milestone
const transformMockMilestone = (mock: typeof mockMilestones[number]): Milestone => ({
  id: mock.id,
  name: mock.name,
  description: mock.description,
  details: mock.details,
  targetAmount: mock.targetAmount,
  raisedAmount: mock.raisedAmount,
  targetDate: mock.targetDate,
  status: mock.status as Milestone["status"],
  published: mock.published
})

/**
 * Transforma MilestoneDTO del API a modelo de dominio Milestone
 */
const transformMilestone = (dto: MilestoneDTO): Milestone => ({
  id: dto.id,
  name: dto.title,
  targetAmount: dto.target_amount,
  raisedAmount: dto.raised_amount,
  targetDate: dto.target_date,
  status: dto.status
})

export function useMilestones(useApi = false) {
  const milestones = ref<Milestone[]>(
    mockMilestones
      .filter(m => m.status !== 'delayed')
      .map(transformMockMilestone)
  )
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const loadMilestones = async () => {
    if (!useApi) return // Usar mocks si no se especifica usar API

    isLoading.value = true
    error.value = null

    try {
      const data = await milestonesRepository.getAll()
      milestones.value = data.map(transformMilestone)
    } catch (err) {
      if (err instanceof MilestoneRepositoryError) {
        console.error('[useMilestones] ❌', err.message, 'HTTP', err.statusCode)
        error.value = err.message
      } else {
        console.error('[useMilestones] ❌ Error inesperado:', err)
        error.value = 'Error al cargar las etapas'
      }
      // Fallback a datos mock en caso de error
      milestones.value = mockMilestones
        .filter(m => m.status !== 'delayed')
        .map(transformMockMilestone)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchMilestones() {
    try {
      const data = await milestonesRepository.getAll()
      milestones.value = data.map(transformMilestone)
    } catch (error) {
      Logger.error('Error fetching milestones', error)
      throw error
    }
  }

  // Auto-cargar si se usa API
  onMounted(() => {
    if (useApi) {
      loadMilestones()
    }
  })

  const totalTargetAmount = computed(() =>
    milestones.value.reduce((total, milestone) => total + milestone.targetAmount, 0)
  )

  const totalRaisedAmount = computed(() =>
    milestones.value.reduce((total, milestone) => total + milestone.raisedAmount, 0)
  )

  const progressPercentage = computed(() => {
    if (totalTargetAmount.value === 0) {
      return 0
    }
    return Math.min(Math.round((totalRaisedAmount.value / totalTargetAmount.value) * 100), 100)
  })

  return {
    milestones,
    totalTargetAmount,
    totalRaisedAmount,
    progressPercentage,
    isLoading,
    error,
    reload: loadMilestones
  }
}
