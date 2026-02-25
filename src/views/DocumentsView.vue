<!--
Path: src/views/DocumentsView.vue
-->

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { documentsRepository, DocumentRepositoryError } from '@/infrastructure/repositories/DocumentsRepository'
import { content } from '@/infrastructure/content'
import { sanitizeExternalLink } from '@/utils/urlSanitizer'

import type { DocumentDTO } from '@/infrastructure/dto'

type DocumentViewModel = DocumentDTO & {
  safeUrl: string | null
}

// State
const documents = ref<DocumentViewModel[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const documentsContent = content.documentsView

// Computed: agrupar documentos por categoría
const categorizedDocuments = computed(() => {
  const grouped: Record<string, DocumentViewModel[]> = {}
  
  documents.value.forEach(doc => {
    const category = doc.category || documentsContent.uncategorizedLabel
    if (!grouped[category]) {
      grouped[category] = []
    }
    grouped[category].push(doc)
  })
  
  return grouped
})

// Computed: orden de categorías para consistencia
const sortedCategories = computed(() => {
  const categoryOrder = documentsContent.categoryOrder
  const categories = Object.keys(categorizedDocuments.value)
  
  // Ordenar según categoryOrder, luego las demás alfabéticamente
  return categories.sort((a, b) => {
    const indexA = categoryOrder.indexOf(a)
    const indexB = categoryOrder.indexOf(b)
    
    if (indexA !== -1 && indexB !== -1) return indexA - indexB
    if (indexA !== -1) return -1
    if (indexB !== -1) return 1
    return a.localeCompare(b)
  })
})

// Cargar documentos del backend
const loadDocuments = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    if (import.meta.env.DEV) {
    }
    const response = await documentsRepository.getAll()
    documents.value = response.map((doc) => ({
      ...doc,
      safeUrl: sanitizeExternalLink(doc.url)
    }))
    if (import.meta.env.DEV) {
    }
  } catch (err) {
    console.error('[DocumentsView] ❌ Error al cargar documentos:', err)
    console.error('Error obteniendo documentos (vista)', err)
    
    if (err instanceof DocumentRepositoryError) {
      error.value = err.message || documentsContent.errorFallback
    } else {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
    }
  } finally {
    isLoading.value = false
  }
}

// Retry handler
const retry = () => {
  loadDocuments()
}

// Cargar documentos al montar el componente
onMounted(() => {
  loadDocuments()
})
</script>

<template>
  <div class="d-flex flex-column">
    <section class="py-5 text-center text-white" style="background: linear-gradient(135deg, #42b983 0%, #2c3e50 100%);">
      <div class="container">
        <h1 class="display-5 fw-bold mb-3">{{ documentsContent.heroTitle }}</h1>
        <p class="lead mb-0">{{ documentsContent.heroSubtitle }}</p>
      </div>
    </section>

    <section class="documents-section py-5">
      <div class="container">
        <!-- Loading State -->
        <div v-if="isLoading" class="alert alert-info text-center">
          {{ documentsContent.loadingLabel }}
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="alert alert-danger d-flex flex-column align-items-center gap-2">
          <div>{{ error }}</div>
          <button @click="retry" class="btn btn-danger">{{ documentsContent.retryLabel }}</button>
        </div>

        <!-- Success State -->
        <div v-else-if="documents.length > 0" >
          <div
            v-for="category in sortedCategories"
            :key="category"
            class="mb-5"
          >
            <h2 class="h4 border-bottom border-3 border-success pb-2 mb-3">{{ category }}</h2>
            <div class="row g-3">
              <component
                v-for="doc in categorizedDocuments[category]"
                :key="doc.id"
                :is="doc.safeUrl ? 'a' : 'div'"
                :href="doc.safeUrl || undefined"
                :target="doc.safeUrl ? '_blank' : undefined"
                :rel="doc.safeUrl ? 'noopener noreferrer' : undefined"
                class="col-12 col-md-6 col-lg-4 text-reset text-decoration-none"
              >
                <div class="card shadow-sm document-card h-100">
                  <div class="card-body">
                    <div class="document-icon">📄</div>
                    <h3 class="h6 mb-2">{{ doc.title }}</h3>
                    <p v-if="doc.description" class="text-muted small mb-3 text-truncate-2">{{ doc.description }}</p>
                    <div class="d-flex gap-3 small text-muted border-top pt-3 mt-auto mb-2">
                      <span class="date text-nowrap">{{
                        new Date(doc.created_at).toLocaleDateString('es-AR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      }}</span>
                      <span v-if="doc.version" class="version text-nowrap">v{{ doc.version }}</span>
                    </div>
                    <div
                      v-if="doc.safeUrl"
                      class="text-success fw-semibold small text-center"
                    >
                      {{ documentsContent.downloadLabel }}
                    </div>
                    <div
                      v-else
                      class="text-danger fw-semibold small text-center"
                    >
                      Enlace bloqueado por seguridad
                    </div>
                  </div>
                </div>
              </component>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-5">
          <p class="fs-5 fw-semibold mb-1">{{ documentsContent.emptyTitle }}</p>
          <p class="text-muted mb-0">{{ documentsContent.emptySubtitle }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

