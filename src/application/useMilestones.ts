import { computed, ref, onMounted } from 'vue'
import type { Milestone } from '@/domain/milestone'
import { content } from '@/infrastructure/content'
import { milestonesRepository } from '@/infrastructure/repositories/MilestonesRepository'
import type { MilestoneDTO } from '@/infrastructure/dto'
import { logger } from '@/infrastructure/logging/logger'
import { toAppError } from '@/application/errors/toAppError'

const transformMockMilestone = (
  mock: (typeof content.data.milestones)[number]
): Milestone => ({
  id: mock.id,
  name: mock.name,
  description: mock.description,
  details: mock.details,
  targetAmount: mock.targetAmount,
  raisedAmount: mock.raisedAmount,
  targetDate: mock.targetDate,
  status: mock.status as Milestone['status'],
  published: mock.published
})

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
    content.data.milestones
      .filter((m) => m.status !== 'delayed')
      .map(transformMockMilestone)
  )
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const loadMilestones = async () => {
    if (!useApi) return

    isLoading.value = true
    error.value = null

    try {
      const data = await milestonesRepository.getAll()
      milestones.value = data.map(transformMilestone)
    } catch (err: unknown) {
      const appError = toAppError(err, 'Error al cargar las etapas')
      logger.event('error', {
        code: 'USE_MILESTONES_LOAD_ERROR',
        context: 'Error al cargar milestones',
        safeDetails: {
          type: appError.type,
          statusCode: appError.statusCode
        }
      })
      error.value = appError.message

      milestones.value = content.data.milestones
        .filter((m) => m.status !== 'delayed')
        .map(transformMockMilestone)
    } finally {
      isLoading.value = false
    }
  }

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
    return Math.min(
      Math.round((totalRaisedAmount.value / totalTargetAmount.value) * 100),
      100
    )
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
