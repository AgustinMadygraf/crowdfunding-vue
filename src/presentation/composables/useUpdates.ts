import { computed, ref, onMounted } from 'vue'
import type { Update, UpdateCategory } from '@/domain/update'
import { content } from '@/presentation/content'
import {
  updatesRepository,
  type GetUpdatesParams
} from '@/infrastructure/repositories/UpdatesRepository'
import type { UpdateDTO } from '@/infrastructure/dto'
import { logger } from '@/infrastructure/logging/logger'
import { toAppError } from '@/application/errors/toAppError'

const transformMockUpdate = (mock: (typeof content.data.updates)[number]): Update => ({
  id: mock.id,
  category: mock.category as UpdateCategory,
  title: mock.title,
  excerpt:
    mock.excerpt ??
    mock.content.substring(0, 200) + (mock.content.length > 200 ? '...' : ''),
  content: mock.content,
  status: mock.status as 'draft' | 'published',
  publishedAt: mock.publishedAt ?? ''
})

const transformUpdate = (dto: UpdateDTO): Update => ({
  id: dto.id,
  category: dto.category.toLowerCase() as UpdateCategory,
  title: dto.title,
  excerpt: dto.content.substring(0, 200) + (dto.content.length > 200 ? '...' : ''),
  content: dto.content,
  status: dto.status as 'draft' | 'published',
  publishedAt: dto.published_at || dto.created_at
})

export function useUpdates(useApi = false, params?: GetUpdatesParams) {
  const updates = ref<Update[]>(
    content.data.updates
      .filter((u) => u.status === 'published' && u.category !== 'general')
      .map(transformMockUpdate)
  )
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const loadUpdates = async () => {
    if (!useApi) return

    isLoading.value = true
    error.value = null

    try {
      const data = await updatesRepository.getAll(params)
      updates.value = data.map(transformUpdate).filter((u) => u.status === 'published')
    } catch (err: unknown) {
      const appError = toAppError(err, 'Error al cargar las actualizaciones')
      logger.event('error', {
        code: 'USE_UPDATES_LOAD_ERROR',
        context: 'Error al cargar updates',
        safeDetails: {
          type: appError.type,
          statusCode: appError.statusCode
        }
      })
      error.value = appError.message

      updates.value = content.data.updates
        .filter((u) => u.status === 'published' && u.category !== 'general')
        .map(transformMockUpdate)
    } finally {
      isLoading.value = false
    }
  }

  onMounted(() => {
    if (useApi) {
      loadUpdates()
    }
  })

  const updatesByCategory = computed(() => {
    const byCategory: Record<UpdateCategory | 'all', Update[]> = {
      all: updates.value,
      comercial: [],
      tecnico: [],
      logistica: [],
      legal: []
    }

    updates.value.forEach((update) => {
      if (update.category in byCategory) {
        byCategory[update.category].push(update)
      }
    })

    return byCategory
  })

  const categoryCounts = computed(() => ({
    all: updates.value.length,
    comercial: updatesByCategory.value.comercial.length,
    tecnico: updatesByCategory.value.tecnico.length,
    logistica: updatesByCategory.value.logistica.length,
    legal: updatesByCategory.value.legal.length
  }))

  return {
    updates,
    updatesByCategory,
    categoryCounts,
    isLoading,
    error,
    reload: loadUpdates
  }
}
