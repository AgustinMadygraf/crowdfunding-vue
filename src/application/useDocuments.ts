import { computed, ref, onMounted } from 'vue'
import {
  documentsRepository,
  DocumentRepositoryError,
  type GetDocumentsParams
} from '@/infrastructure/repositories/DocumentsRepository'
import type { DocumentDTO } from '@/infrastructure/dto'
import { logger } from '@/infrastructure/logging/logger'

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
      if (err instanceof DocumentRepositoryError) {
        logger.event('error', {
          code: 'USE_DOCUMENTS_REPO_ERROR',
          context: 'Error en repositorio de documentos',
          safeDetails: { statusCode: err.statusCode }
        })
        error.value = err.message
      } else {
        logger.event('error', {
          code: 'USE_DOCUMENTS_UNEXPECTED_ERROR',
          context: 'Error inesperado al cargar documentos'
        })
        error.value = 'Error al cargar los documentos'
      }

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
