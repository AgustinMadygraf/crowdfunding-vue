<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { documentsRepository, DocumentRepositoryError } from '@/infrastructure/repositories/DocumentsRepository'
import { content } from '@/infrastructure/content'

import type { DocumentDTO } from '@/infrastructure/dto'

// State
const documents = ref<DocumentDTO[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const documentsContent = content.documentsView

// Computed: agrupar documentos por categoría
const categorizedDocuments = computed(() => {
  const grouped: Record<string, DocumentDTO[]> = {}
  
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
    documents.value = await documentsRepository.getAll()
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
  <div class="documents-view">
    <section class="hero-section">
      <div class="container-narrow">
        <h1>{{ documentsContent.heroTitle }}</h1>
        <p class="subtitle">{{ documentsContent.heroSubtitle }}</p>
      </div>
    </section>

    <section class="documents-section section-padding">
      <div class="container-narrow">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
          <p>{{ documentsContent.loadingLabel }}</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
          <button @click="retry" class="btn-retry">{{ documentsContent.retryLabel }}</button>
        </div>

        <!-- Success State -->
        <div v-else-if="documents.length > 0" class="documents-container">
          <div
            v-for="category in sortedCategories"
            :key="category"
            class="category-section"
          >
            <h2 class="category-title">{{ category }}</h2>
            <div class="documents-grid">
              <a
                v-for="doc in categorizedDocuments[category]"
                :key="doc.id"
                :href="doc.url"
                target="_blank"
                rel="noopener noreferrer"
                class="card-base document-card"
              >
                <div class="document-icon">📄</div>
                <h3>{{ doc.title }}</h3>
                <p v-if="doc.description" class="description">{{ doc.description }}</p>
                <div class="document-meta">
                  <span class="date">{{
                    new Date(doc.created_at).toLocaleDateString('es-AR', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })
                  }}</span>
                  <span v-if="doc.version" class="version">v{{ doc.version }}</span>
                </div>
                <div class="download-hint">{{ documentsContent.downloadLabel }}</div>
              </a>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <p>{{ documentsContent.emptyTitle }}</p>
          <p class="subtitle">{{ documentsContent.emptySubtitle }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.documents-view {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.hero-section {
  padding: 80px 20px 40px;
  background: linear-gradient(135deg, #42b983 0%, #2c3e50 100%);
  color: white;
  text-align: center;
}

.hero-section h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  font-size: 1.1rem;
  color: #666;
}

/* Error State */
.error-state {
  text-align: center;
  padding: 3rem 2rem;
  background: #fef2f2;
  border: 2px solid #fca5a5;
  border-radius: 8px;
  color: #dc2626;
}

.error-state p {
  margin-bottom: 1.5rem;
}

.btn-retry {
  padding: 0.75rem 1.5rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s ease;
}

.btn-retry:hover {
  background: #b91c1c;
}

/* Documents Container */
.documents-container {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.category-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.category-title {
  font-size: 1.75rem;
  color: #2c3e50;
  border-bottom: 3px solid #42b983;
  padding-bottom: 0.75rem;
  margin: 0;
}

.documents-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.document-card {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.document-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #42b983;
  transform: translateX(-100%);
  transition: transform 0.2s ease;
}

.document-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #42b983;
}

.document-card:hover::before {
  transform: translateX(0);
}

.document-icon {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

.document-card h3 {
  font-size: 1.125rem;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.description {
  font-size: 0.875rem;
  color: #666;
  margin: 0.5rem 0 1rem 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.document-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #999;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
  margin-bottom: 0.75rem;
}

.date,
.version {
  white-space: nowrap;
}

.download-hint {
  font-size: 0.875rem;
  color: #42b983;
  font-weight: 600;
  text-align: center;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.document-card:hover .download-hint {
  opacity: 1;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: #f5f5f5;
  border-radius: 8px;
}

.empty-state p:first-child {
  font-size: 1.25rem;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.empty-state .subtitle {
  color: #666;
  margin: 0;
}

@media (max-width: 768px) {
  .hero-section h1 {
    font-size: 2rem;
  }

  .category-title {
    font-size: 1.5rem;
  }

  .documents-grid {
    grid-template-columns: 1fr;
  }

  .document-card {
    padding: 1rem;
  }

  .document-icon {
    font-size: 1.5rem;
  }

  .document-card h3 {
    font-size: 1rem;
  }
}
</style>
