<script setup lang="ts">
import { ref, computed } from 'vue';
import { mockUpdates } from '@/infrastructure/mockData';
import UpdateCard from '@/components/updates/UpdateCard.vue';
import type { Update, UpdateCategory } from '@/domain/update';

const updates = ref<Update[]>(mockUpdates.filter(u => u.status === 'published'));
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

const categories = [
  { value: 'all', label: 'Todas', count: updates.value.length },
  { value: 'comercial', label: 'Comercial', count: updates.value.filter(u => u.category === 'comercial').length },
  { value: 'tecnico', label: 'Técnico', count: updates.value.filter(u => u.category === 'tecnico').length },
  { value: 'logistica', label: 'Logística', count: updates.value.filter(u => u.category === 'logistica').length },
  { value: 'legal', label: 'Legal', count: updates.value.filter(u => u.category === 'legal').length },
];

const handleCardClick = (update: Update) => {
  selectedUpdate.value = update;
  showModal.value = true;
};

const handleCloseModal = () => {
  showModal.value = false;
  selectedUpdate.value = null;
};
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
            <span class="count">{{ cat.count }}</span>
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
                class="category-badge" 
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
            <button class="btn btn-primary" @click="handleCloseModal">Cerrar</button>
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
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  color: white;
  text-align: center;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

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

/* Filtros */
.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 40px;
  flex-wrap: wrap;
  justify-content: center;
}

.filter-btn {
  padding: 10px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 24px;
  background-color: white;
  color: #666;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-btn:hover {
  border-color: #2196f3;
  color: #2196f3;
}

.filter-btn.active {
  background-color: #2196f3;
  border-color: #2196f3;
  color: white;
}

.filter-btn .count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  border-radius: 12px;
  background-color: rgba(0, 0, 0, 0.1);
  font-size: 12px;
  font-weight: 700;
}

.filter-btn.active .count {
  background-color: rgba(255, 255, 255, 0.25);
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

/* Modal */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  overflow-y: auto;
}

.modal-content {
  background-color: white;
  border-radius: 16px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 32px 32px 24px;
  border-bottom: 1px solid #e0e0e0;
  gap: 16px;
}

.modal-header > div {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: white;
  width: fit-content;
}

.category-badge.category-comercial {
  background-color: #2196f3;
}

.category-badge.category-tecnico {
  background-color: #ff9800;
}

.category-badge.category-logistica {
  background-color: #9c27b0;
}

.category-badge.category-legal {
  background-color: #4caf50;
}

.modal-header .date {
  font-size: 13px;
  color: #999;
}

.btn-close {
  background: none;
  border: none;
  font-size: 32px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-close:hover {
  background-color: #f5f5f5;
  color: #111;
}

.modal-body {
  padding: 32px;
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

.modal-footer {
  padding: 24px 32px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #2196f3;
  color: white;
}

.btn-primary:hover {
  background-color: #1976d2;
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

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 24px;
  }

  .modal-body h2 {
    font-size: 24px;
  }
}
</style>
