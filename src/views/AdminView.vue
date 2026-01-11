<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { milestonesRepository, MilestoneRepositoryError } from '@/infrastructure/repositories/MilestonesRepository'
import { updatesRepository, UpdateRepositoryError } from '@/infrastructure/repositories/UpdatesRepository'
import { contributionsRepository, ContributionRepositoryError } from '@/infrastructure/repositories/ContributionsRepository'
import type { MilestoneDTO, UpdateDTO } from '@/infrastructure/dto'

const router = useRouter()
const authStore = useAuthStore()

// State
const milestones = ref<MilestoneDTO[]>([])
const updates = ref<UpdateDTO[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const activeTab = ref<'dashboard' | 'milestones' | 'updates'>('dashboard')

// Check authentication
onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  loadData()
})

// Load all data
const loadData = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    if (import.meta.env.DEV) {
      console.log('[AdminView] Cargando datos administrativos...')
    }
    
    // Cargar milestones
    try {
      milestones.value = await milestonesRepository.getAll()
      if (import.meta.env.DEV) {
        console.log('[AdminView] ✅ Milestones cargados:', milestones.value.length)
      }
    } catch (err) {
      console.warn('[AdminView] ⚠️ Error cargando milestones:', err)
    }
    
    // Cargar updates
    try {
      updates.value = await updatesRepository.getAll()
      if (import.meta.env.DEV) {
        console.log('[AdminView] ✅ Updates cargados:', updates.value.length)
      }
    } catch (err) {
      console.warn('[AdminView] ⚠️ Error cargando updates:', err)
    }
  } catch (err) {
    console.error('[AdminView] ❌ Error al cargar datos:', err)
    error.value = 'Error al cargar datos administrativos'
  } finally {
    isLoading.value = false
  }
}

// Computed stats
const stats = computed(() => ({
  totalMilestones: milestones.value.length,
  activeMilestones: milestones.value.filter(m => m.status === 'active').length,
  completedMilestones: milestones.value.filter(m => m.status === 'completed').length,
  totalUpdates: updates.value.length,
  publishedUpdates: updates.value.filter(u => u.status === 'published').length
}))

// Handlers
const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

const retry = () => {
  loadData()
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="admin-view">
    <!-- Header -->
    <header class="admin-header">
      <div class="container">
        <h1>Panel de Administración</h1>
        <div class="header-info">
          <span class="user-info">👤 {{ authStore.user?.nombre || authStore.user?.email }}</span>
          <button @click="handleLogout" class="logout-button">Cerrar sesión</button>
        </div>
      </div>
    </header>

    <!-- Auth Check Message -->
    <div v-if="!authStore.isAuthenticated" class="auth-required">
      <p>Debes estar autenticado para acceder al panel administrativo.</p>
      <router-link to="/login" class="btn-login">Iniciar sesión</router-link>
    </div>

    <!-- Main Content -->
    <main v-else class="admin-main">
      <div class="container">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
          <p>Cargando datos...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
          <button @click="retry" class="btn-retry">Reintentar</button>
        </div>

        <!-- Dashboard -->
        <div v-else>
          <!-- Tabs -->
          <div class="tabs">
            <button
              @click="activeTab = 'dashboard'"
              :class="['tab', { active: activeTab === 'dashboard' }]"
            >
              📊 Dashboard
            </button>
            <button
              @click="activeTab = 'milestones'"
              :class="['tab', { active: activeTab === 'milestones' }]"
            >
              🎯 Etapas ({{ stats.totalMilestones }})
            </button>
            <button
              @click="activeTab = 'updates'"
              :class="['tab', { active: activeTab === 'updates' }]"
            >
              📝 Actualizaciones ({{ stats.totalUpdates }})
            </button>
          </div>

          <!-- Dashboard Tab -->
          <div v-show="activeTab === 'dashboard'" class="tab-content">
            <div class="stats-grid">
              <div class="stat-card">
                <h3>Etapas totales</h3>
                <p class="stat-value">{{ stats.totalMilestones }}</p>
                <p class="stat-detail">{{ stats.activeMilestones }} activas</p>
              </div>
              <div class="stat-card">
                <h3>Etapas completadas</h3>
                <p class="stat-value">{{ stats.completedMilestones }}</p>
              </div>
              <div class="stat-card">
                <h3>Actualizaciones</h3>
                <p class="stat-value">{{ stats.totalUpdates }}</p>
                <p class="stat-detail">{{ stats.publishedUpdates }} publicadas</p>
              </div>
              <div class="stat-card">
                <h3>Estado</h3>
                <p class="stat-value status-ok">✅ Online</p>
              </div>
            </div>

            <section class="admin-section">
              <h2>Atajos rápidos</h2>
              <div class="shortcuts">
                <button class="shortcut" @click="activeTab = 'milestones'">
                  <span class="icon">🎯</span>
                  <span class="label">Gestionar etapas</span>
                </button>
                <button class="shortcut" @click="activeTab = 'updates'">
                  <span class="icon">📝</span>
                  <span class="label">Crear actualización</span>
                </button>
                <a href="mailto:info@madypack.com.ar" class="shortcut">
                  <span class="icon">📧</span>
                  <span class="label">Contactar soporte</span>
                </a>
              </div>
            </section>
          </div>

          <!-- Milestones Tab -->
          <div v-show="activeTab === 'milestones'" class="tab-content">
            <section class="admin-section">
              <h2>Gestión de Etapas</h2>
              
              <div v-if="milestones.length === 0" class="empty-message">
                <p>No hay etapas registradas</p>
              </div>
              
              <div v-else class="items-list">
                <div v-for="milestone in milestones" :key="milestone.id" class="item-card">
                  <div class="item-header">
                    <h3>{{ milestone.title }}</h3>
                    <span :class="['status-badge', `status-${milestone.status}`]">
                      {{ milestone.status }}
                    </span>
                  </div>
                  <p class="item-description">{{ milestone.description }}</p>
                  <div class="item-meta">
                    <span>📅 {{ formatDate(milestone.created_at || '') }}</span>
                    <span>🎯 Meta: ${{ milestone.target_amount?.toLocaleString('es-AR') }}</span>
                    <span>💰 Recaudado: ${{ milestone.raised_amount?.toLocaleString('es-AR') }}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <!-- Updates Tab -->
          <div v-show="activeTab === 'updates'" class="tab-content">
            <section class="admin-section">
              <h2>Gestión de Actualizaciones</h2>
              
              <div v-if="updates.length === 0" class="empty-message">
                <p>No hay actualizaciones registradas</p>
              </div>
              
              <div v-else class="items-list">
                <div v-for="update in updates" :key="update.id" class="item-card">
                  <div class="item-header">
                    <h3>{{ update.title }}</h3>
                    <span :class="['status-badge', `status-${update.status}`]">
                      {{ update.status }}
                    </span>
                  </div>
                  <p class="item-description">{{ update.content }}</p>
                  <div class="item-meta">
                    <span>📂 {{ update.category }}</span>
                    <span>📅 {{ formatDate(update.created_at) }}</span>
                    <span v-if="update.published_at">
                      ✓ Publicado: {{ formatDate(update.published_at) }}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.admin-view {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.admin-header {
  background: #2c3e50;
  color: white;
  padding: 1.5rem 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.admin-header .container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.admin-header h1 {
  font-size: 1.5rem;
  margin: 0;
}

.header-info {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.user-info {
  font-size: 0.9rem;
  opacity: 0.9;
}

.logout-button {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s ease;
}

.logout-button:hover {
  background: #c0392b;
}

.auth-required {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  margin: 2rem 20px;
  border-radius: 8px;
  border-left: 4px solid #e74c3c;
}

.auth-required p {
  color: #e74c3c;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

.btn-login {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #42b983;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 600;
  transition: background 0.2s ease;
}

.btn-login:hover {
  background: #359268;
}

.admin-main {
  padding: 2rem 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Loading & Error States */
.loading-state,
.error-state {
  text-align: center;
  padding: 3rem 2rem;
  background: white;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.error-state {
  border-left: 4px solid #e74c3c;
  color: #e74c3c;
}

.btn-retry {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.btn-retry:hover {
  background: #c0392b;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e0e0e0;
}

.tab {
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 600;
  color: #666;
  border-bottom: 3px solid transparent;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.tab:hover {
  color: #2c3e50;
}

.tab.active {
  color: #42b983;
  border-bottom-color: #42b983;
}

.tab-content {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Stats Grid */
.stats-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  text-align: center;
  border-top: 4px solid #42b983;
}

.stat-card h3 {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2c3e50;
  margin: 0.5rem 0;
}

.stat-detail {
  font-size: 0.875rem;
  color: #999;
  margin: 0;
}

.status-ok {
  color: #42b983;
}

/* Shortcuts */
.shortcuts {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  margin-top: 1.5rem;
}

.shortcut {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  text-decoration: none;
  color: #2c3e50;
  transition: all 0.2s ease;
  font-family: inherit;
}

.shortcut:hover {
  border-color: #42b983;
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.1);
}

.shortcut .icon {
  font-size: 2rem;
}

.shortcut .label {
  font-weight: 600;
  text-align: center;
  font-size: 0.875rem;
}

/* Admin Section */
.admin-section {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.admin-section h2 {
  font-size: 1.25rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

/* Items List */
.items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.item-card {
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 1.5rem;
  transition: all 0.2s ease;
}

.item-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: #42b983;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.item-header h3 {
  font-size: 1.1rem;
  color: #2c3e50;
  margin: 0;
  flex: 1;
}

.status-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-active {
  background: #dcfce7;
  color: #166534;
}

.status-completed {
  background: #dbeafe;
  color: #1e40af;
}

.status-draft {
  background: #f3f4f6;
  color: #374151;
}

.status-published {
  background: #dcfce7;
  color: #166534;
}

.item-description {
  color: #666;
  margin: 0.75rem 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-meta {
  display: flex;
  gap: 1.5rem;
  font-size: 0.875rem;
  color: #999;
  flex-wrap: wrap;
  padding-top: 0.75rem;
  border-top: 1px solid #e0e0e0;
}

/* Empty Message */
.empty-message {
  text-align: center;
  padding: 3rem 2rem;
  color: #999;
  font-style: italic;
}

@media (max-width: 768px) {
  .admin-header .container {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .header-info {
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .tabs {
    flex-wrap: wrap;
  }

  .tab {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }

  .item-header {
    flex-direction: column;
  }

  .status-badge {
    align-self: flex-start;
  }

  .item-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
