/**
 * Composable: useDocuments
 * Gestiona el estado y operaciones de documentos públicos
 */

import { computed, ref, onMounted } from 'vue'
import { documentsRepository, DocumentRepositoryError, type GetDocumentsParams } from '@/infrastructure/repositories/DocumentsRepository'
import type { DocumentDTO } from '@/infrastructure/dto'


export interface Document {
  id: number
  category: string
  title: string
  url: string
  checksum_sha256?: string
  version?: string
  createdAt: string
}

/**
 * Transforma DocumentDTO del API a modelo de dominio Document
 */
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
    if (!useApi) return // No hay mocks para documents aún

    isLoading.value = true
    error.value = null

    try {
      const data = await documentsRepository.getAll(params)
      documents.value = data.map(transformDocument)
    } catch (err) {
      if (err instanceof DocumentRepositoryError) {
        console.error('[useDocuments] ❌', err.message, 'HTTP', err.statusCode)
        error.value = err.message
      } else {
        console.error('[useDocuments] ❌ Error inesperado:', err)
        error.value = 'Error al cargar los documentos'
      }
      documents.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function fetchDocuments() {
    try {
      // ...existing code...
    } catch (error) {
      console.error('Error fetching documents', error)
      throw error
    }
  }

  // Auto-cargar si se usa API
  onMounted(() => {
    if (useApi) {
      loadDocuments()
    }
  })

  const documentsByCategory = computed(() => {
    const byCategory: Record<string, Document[]> = {}

    documents.value.forEach(doc => {
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
