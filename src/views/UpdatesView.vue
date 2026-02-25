<!--
Path: src/views/UpdatesView.vue
-->

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUpdates } from '@/presentation/composables/useUpdates';
import UpdateCard from '@/components/updates/UpdateCard.vue';
import type { Update, UpdateCategory } from '@/domain/update';
import { content } from '@/presentation/content';
;

const { updates, categoryCounts } = useUpdates(false); // false = usar mocks
const selectedCategory = ref<UpdateCategory | 'all'>('all');
const selectedUpdate = ref<Update | null>(null);
const showModal = ref(false);
const updatesViewContent = content.updatesView;

const filteredUpdates = computed(() => {
  if (selectedCategory.value === 'all') {
    return updates.value;
  }
  return updates.value.filter(u => u.category === selectedCategory.value);
});

const sortedUpdates = computed(() => {
  return [...filteredUpdates.value].sort((a, b) => {
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
});

const categories = computed(() => [
  { value: 'all', label: updatesViewContent.categoryFilters.all, count: categoryCounts.value.all },
  { value: 'comercial', label: updatesViewContent.categoryFilters.comercial, count: categoryCounts.value.comercial },
  { value: 'tecnico', label: updatesViewContent.categoryFilters.tecnico, count: categoryCounts.value.tecnico },
  { value: 'logistica', label: updatesViewContent.categoryFilters.logistica, count: categoryCounts.value.logistica },
  { value: 'legal', label: updatesViewContent.categoryFilters.legal, count: categoryCounts.value.legal },
]);

const handleCardClick = (update: Update) => {
  selectedUpdate.value = update;
  showModal.value = true;
};

const handleCloseModal = () => {
  showModal.value = false;
  selectedUpdate.value = null;
};

const categoryBadgeStyle = (category: string) => ({
  backgroundColor: `var(--category-${category})`
});

const fetchUpdates = async () => {
  try {
    // Lógica para obtener updates
  } catch (error) {
    console.error('Error obteniendo updates (vista)', error);
    // Manejo de error adicional si es necesario
  }
};

fetchUpdates();
</script>

<template>
  <div class="min-vh-100 bg-light">
    <section class="py-5 text-center text-white" style="background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);">
      <div class="container">
        <h1 class="display-6 fw-bold mb-2">{{ updatesViewContent.heroTitle }}</h1>
        <p class="lead mb-1">{{ updatesViewContent.heroSubtitle }}</p>
        <p class="small mb-0">{{ sortedUpdates.length }} {{ updatesViewContent.statsLabel }}</p>
      </div>
    </section>

    <section class="py-5">
      <div class="container">
        <!-- Filtros de categoría -->
        <div class="d-flex gap-2 flex-wrap justify-content-center mb-4">
          <button
            v-for="cat in categories"
            :key="cat.value"
            class="filter-btn"
            :class="{ active: selectedCategory === cat.value }"
            @click="selectedCategory = cat.value as UpdateCategory | 'all'"
          >
            {{ cat.label }}
            <span class="filter-count">{{ cat.count }}</span>
          </button>
        </div>

        <!-- Grid de updates -->
        <div class="row g-4">
          <div
            v-for="update in sortedUpdates"
            :key="update.id"
            class="col-12 col-md-6 col-lg-4"
            @click="handleCardClick(update)"
            role="button"
            tabindex="0"
            @keydown.enter="handleCardClick(update)"
            @keydown.space="handleCardClick(update)"
          >
            <UpdateCard :update="update" />
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="sortedUpdates.length === 0" class="text-center py-5 text-muted">
          <p class="mb-0">{{ updatesViewContent.emptyState }}</p>
        </div>
      </div>
    </section>

    <!-- Modal de detalle -->
    <teleport to="body">
      <div v-if="showModal && selectedUpdate" class="modal-backdrop" @click="handleCloseModal">
        <div class="modal-content" role="dialog" aria-modal="true" @click.stop>
          <header class="modal-header">
            <div class="d-flex flex-column gap-2">
              <span
                class="badge"
                :style="categoryBadgeStyle(selectedUpdate.category)"
              >
                {{ selectedUpdate.category }}
              </span>
              <time class="small text-muted">
                {{ new Date(selectedUpdate.publishedAt).toLocaleDateString('es-AR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) }}
              </time>
            </div>
            <button
              type="button"
              class="btn-close"
              :aria-label="updatesViewContent.modalCloseLabel"
              @click="handleCloseModal"
            ></button>
          </header>

          <div class="modal-body">
            <h2 class="h3 mb-4">{{ selectedUpdate.title }}</h2>
            <div class="lh-lg text-body-secondary" style="white-space: pre-line;">
              {{ selectedUpdate.content }}
            </div>
          </div>

          <footer class="modal-footer">
            <button class="btn btn-primary" @click="handleCloseModal">{{ updatesViewContent.modalCloseLabel }}</button>
          </footer>
        </div>
      </div>
    </teleport>
  </div>
</template>

