<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUpdates } from '@/application/useUpdates';
import UpdateCard from '@/components/updates/UpdateCard.vue';
import type { Update, UpdateCategory } from '@/domain/update';
;

const { updates, categoryCounts } = useUpdates(false); // false = usar mocks
const selectedCategory = ref<UpdateCategory | 'all'>('all');
const selectedUpdate = ref<Update | null>(null);
const showModal = ref(false);

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
  { value: 'all', label: 'Todas', count: categoryCounts.value.all },
  { value: 'comercial', label: 'Comercial', count: categoryCounts.value.comercial },
  { value: 'tecnico', label: 'Técnico', count: categoryCounts.value.tecnico },
  { value: 'logistica', label: 'Logística', count: categoryCounts.value.logistica },
  { value: 'legal', label: 'Legal', count: categoryCounts.value.legal },
]);

const handleCardClick = (update: Update) => {
  selectedUpdate.value = update;
  showModal.value = true;
};

const handleCloseModal = () => {
  showModal.value = false;
  selectedUpdate.value = null;
};

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
  <div class="updates-view">
    <section class="hero-section">
      <div class="container">
        <h1>Actualizaciones del Proyecto</h1>
        <p class="subtitle">Seguimiento transparente del progreso de la RKHA190</p>
        <p class="stats">{{ sortedUpdates.length }} actualizaciones publicadas</p>
      </div>
    </section>

    <section class="updates-section">
      <div class="container">
        <!-- Filtros de categoría -->
        <div class="filters">
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
        <div class="updates-grid">
          <div
            v-for="update in sortedUpdates"
            :key="update.id"
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
        <div v-if="sortedUpdates.length === 0" class="empty-state">
          <p>No hay actualizaciones en esta categoría aún.</p>
        </div>
      </div>
    </section>

    <!-- Modal de detalle -->
    <teleport to="body">
      <div v-if="showModal && selectedUpdate" class="modal-backdrop" @click="handleCloseModal">
        <div class="modal-content" role="dialog" aria-modal="true" @click.stop>
          <header class="modal-header">
            <div>
              <span 
                class="badge-category" 
                :class="`category-${selectedUpdate.category}`"
              >
                {{ selectedUpdate.category }}
              </span>
              <time class="date">
                {{ new Date(selectedUpdate.publishedAt).toLocaleDateString('es-AR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) }}
              </time>
            </div>
            <button class="btn-close" @click="handleCloseModal" aria-label="Cerrar">×</button>
          </header>

          <div class="modal-body">
            <h2>{{ selectedUpdate.title }}</h2>
            <div class="content">
              {{ selectedUpdate.content }}
            </div>
          </div>

          <footer class="modal-footer">
            <button class="btn-primary" @click="handleCloseModal">Cerrar</button>
          </footer>
        </div>
      </div>
    </teleport>
  </div>
</template>

<style scoped>
.updates-view {
  min-height: 100vh;
  background-color: #f9fafb;
}

.hero-section {
  padding: 60px 20px 40px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: white;
  text-align: center;
}

/* container en components.css */

.hero-section h1 {
  font-size: 36px;
  margin: 0 0 12px 0;
  font-weight: 700;
}

.subtitle {
  font-size: 18px;
  margin: 0 0 8px 0;
  opacity: 0.95;
}

.stats {
  font-size: 14px;
  margin: 0;
  opacity: 0.85;
}

.updates-section {
  padding: 60px 20px;
}

/* Filtros - usa filter-btn de components.css */
.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 40px;
  flex-wrap: wrap;
  justify-content: center;
}

/* Grid */
.updates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-state p {
  margin: 0;
  font-size: 16px;
}

/* Modal - usa clases base de components.css */
.modal-header > div {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Colores específicos para badges de categoría */
.badge-category.category-comercial {
  background-color: var(--category-comercial);
}

.badge-category.category-tecnico {
  background-color: var(--category-tecnico);
}

.badge-category.category-logistica {
  background-color: var(--category-logistica);
}

.badge-category.category-legal {
  background-color: var(--category-legal);
}

.modal-header .date {
  font-size: 13px;
  color: #999;
}

.modal-body h2 {
  margin: 0 0 24px 0;
  font-size: 28px;
  color: #111;
  line-height: 1.3;
}

.modal-body .content {
  font-size: 16px;
  line-height: 1.8;
  color: #444;
  white-space: pre-line;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 40px 20px 30px;
  }

  .hero-section h1 {
    font-size: 28px;
  }

  .subtitle {
    font-size: 16px;
  }

  .updates-section {
    padding: 40px 20px;
  }

  .filters {
    margin-bottom: 30px;
  }

  .updates-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .modal-body h2 {
    font-size: 24px;
  }
}
</style>
