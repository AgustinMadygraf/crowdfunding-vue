/**
 * Composable: useUpdates
 * Gestiona el estado y operaciones de actualizaciones del proyecto
 */

import { computed, ref, onMounted } from 'vue'
import type { Update, UpdateCategory } from '@/domain/update'
import { mockUpdates } from '@/infrastructure/mockData'
import { updatesRepository, UpdateRepositoryError, type GetUpdatesParams } from '@/infrastructure/repositories/UpdatesRepository'
import type { UpdateDTO } from '@/infrastructure/dto'

/**
 * Transforma UpdateDTO del API a modelo de dominio Update
 */
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
  const updates = ref<Update[]>([...mockUpdates.filter(u => u.status === 'published')])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const loadUpdates = async () => {
    if (!useApi) return // Usar mocks si no se especifica usar API

    isLoading.value = true
    error.value = null

    try {
      const data = await updatesRepository.getAll(params)
      updates.value = data
        .map(transformUpdate)
        .filter(u => u.status === 'published')
    } catch (err) {
      if (err instanceof UpdateRepositoryError) {
        console.error('[useUpdates] ❌', err.message, 'HTTP', err.statusCode)
        error.value = err.message
      } else {
        console.error('[useUpdates] ❌ Error inesperado:', err)
        error.value = 'Error al cargar las actualizaciones'
      }
      // Fallback a datos mock en caso de error
      updates.value = [...mockUpdates.filter(u => u.status === 'published')]
    } finally {
      isLoading.value = false
    }
  }

  // Auto-cargar si se usa API
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

    updates.value.forEach(update => {
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
