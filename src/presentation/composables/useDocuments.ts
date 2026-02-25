import { computed, ref, onMounted } from 'vue'
import {
  documentsRepository,
  type GetDocumentsParams
} from '@/infrastructure/repositories/DocumentsRepository'
import type { DocumentDTO } from '@/infrastructure/dto'
import { logger } from '@/infrastructure/logging/logger'
import { toAppError } from '@/application/errors/toAppError'

export interface Document {
  id: number
  category: string
  title: string
  url: string
  checksum_sha256?: string
  version?: string
  createdAt: string
}

const transformDocument = (dto: DocumentDTO): Document => ({
  id: dto.id,
  category: dto.category,
  title: dto.title,
  url: dto.url,
  checksum_sha256: dto.checksum_sha256,
  version: dto.version,
  createdAt: dto.created_at
})

export function useDocuments(useApi = false, params?: GetDocumentsParams) {
  const documents = ref<Document[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const loadDocuments = async () => {
    if (!useApi) return

    isLoading.value = true
    error.value = null

    try {
      const data = await documentsRepository.getAll(params)
      documents.value = data.map(transformDocument)
    } catch (err: unknown) {
      const appError = toAppError(err, 'Error al cargar los documentos')
      logger.event('error', {
        code: 'USE_DOCUMENTS_LOAD_ERROR',
        context: 'Error al cargar documentos',
        safeDetails: {
          type: appError.type,
          statusCode: appError.statusCode
        }
      })
      error.value = appError.message

      documents.value = []
    } finally {
      isLoading.value = false
    }
  }

  onMounted(() => {
    if (useApi) {
      loadDocuments()
    }
  })

  const documentsByCategory = computed(() => {
    const byCategory: Record<string, Document[]> = {}

    documents.value.forEach((doc) => {
      if (!byCategory[doc.category]) {
        byCategory[doc.category] = []
      }
      byCategory[doc.category].push(doc)
    })

    return byCategory
  })

  const categoriesWithCounts = computed(() => {
    return Object.entries(documentsByCategory.value).map(([category, docs]) => ({
      category,
      count: docs.length
    }))
  })

  return {
    documents,
    documentsByCategory,
    categoriesWithCounts,
    isLoading,
    error,
    reload: loadDocuments
  }
}
