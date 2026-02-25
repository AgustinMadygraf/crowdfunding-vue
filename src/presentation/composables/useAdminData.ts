import { computed, ref } from 'vue'
import { milestonesRepository } from '@/infrastructure/repositories/MilestonesRepository'
import { updatesRepository } from '@/infrastructure/repositories/UpdatesRepository'
import { toAppError } from '@/application/errors/toAppError'
import { logger } from '@/infrastructure/logging/logger'

export interface AdminMilestone {
  id: number
  title: string
  description: string
  status: string
  targetAmount: number
  raisedAmount: number
  createdAt: string
}

export interface AdminUpdate {
  id: number
  title: string
  content: string
  status: string
  category: string
  createdAt: string
  publishedAt: string | null
}

const mapMilestone = (dto: Awaited<ReturnType<typeof milestonesRepository.getAll>>[number]): AdminMilestone => ({
  id: dto.id,
  title: dto.title,
  description: dto.description,
  status: dto.status,
  targetAmount: dto.target_amount,
  raisedAmount: dto.raised_amount,
  createdAt: dto.created_at || dto.target_date
})

const mapUpdate = (dto: Awaited<ReturnType<typeof updatesRepository.getAll>>[number]): AdminUpdate => ({
  id: dto.id,
  title: dto.title,
  content: dto.content,
  status: dto.status,
  category: dto.category,
  createdAt: dto.created_at,
  publishedAt: dto.published_at
})

export function useAdminData() {
  const milestones = ref<AdminMilestone[]>([])
  const updates = ref<AdminUpdate[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const loadData = async () => {
    isLoading.value = true
    error.value = null

    try {
      const [milestonesData, updatesData] = await Promise.all([
        milestonesRepository.getAll(),
        updatesRepository.getAll()
      ])

      milestones.value = milestonesData.map(mapMilestone)
      updates.value = updatesData.map(mapUpdate)
    } catch (err: unknown) {
      const appError = toAppError(err, 'Error al cargar datos administrativos')
      logger.event('error', {
        code: 'USE_ADMIN_DATA_LOAD_ERROR',
        context: 'Error al cargar milestones y updates para admin',
        safeDetails: {
          type: appError.type,
          statusCode: appError.statusCode
        }
      })
      error.value = appError.message
    } finally {
      isLoading.value = false
    }
  }

  const stats = computed(() => ({
    totalMilestones: milestones.value.length,
    activeMilestones: milestones.value.filter((m) => m.status === 'active').length,
    completedMilestones: milestones.value.filter((m) => m.status === 'completed').length,
    totalUpdates: updates.value.length,
    publishedUpdates: updates.value.filter((u) => u.status === 'published').length
  }))

  return {
    milestones,
    updates,
    isLoading,
    error,
    stats,
    loadData
  }
}
