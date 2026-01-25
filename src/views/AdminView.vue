<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { milestonesRepository, MilestoneRepositoryError } from '@/infrastructure/repositories/MilestonesRepository'
import { updatesRepository, UpdateRepositoryError } from '@/infrastructure/repositories/UpdatesRepository'
import type { MilestoneDTO, UpdateDTO } from '@/infrastructure/dto'
import { content } from '@/infrastructure/content'


const router = useRouter()
const authStore = useAuthStore()
const adminContent = content.adminView

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
    }
    
    // Cargar milestones
    try {
      milestones.value = await milestonesRepository.getAll()
      if (import.meta.env.DEV) {
      }
    } catch (err) {
      console.warn('[AdminView] ⚠️ Error cargando milestones:', err)
    }
    
    // Cargar updates
    try {
      updates.value = await updatesRepository.getAll()
      if (import.meta.env.DEV) {
      }
    } catch (err) {
      console.warn('[AdminView] ⚠️ Error cargando updates:', err)
    }
  } catch (err) {
    console.error('[AdminView] ❌ Error al cargar datos:', err)
    error.value = adminContent.errors.loadData
  } finally {
    isLoading.value = false
  }
}

const fetchAdminData = async () => {
  try {
    isLoading.value = true
    error.value = null

    // Cargar milestones
    milestones.value = await milestonesRepository.getAll()

    // Cargar updates
    updates.value = await updatesRepository.getAll()
  } catch (err) {
    console.error('Error obteniendo datos de admin', err)
    error.value = err instanceof Error ? err.message : adminContent.errors.fetchAdmin
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

const getStatusBadgeClass = (status: string) => {
  const map: Record<string, string> = {
    pending: 'text-bg-warning',
    active: 'text-bg-success',
    completed: 'text-bg-success',
    draft: 'text-bg-secondary',
    published: 'text-bg-success'
  }
  return map[status] || 'text-bg-secondary'
}
</script>

<template>
  <div class="admin-view">
    <!-- Header -->
    <header class="admin-header">
      <div class="container">
        <h1>{{ adminContent.title }}</h1>
        <div class="header-info">
          <span class="user-info">👤 {{ authStore.user?.nombre || authStore.user?.email }}</span>
          <button @click="handleLogout" class="btn btn-danger btn-sm">{{ adminContent.logoutLabel }}</button>
        </div>
      </div>
    </header>

    <!-- Auth Check Message -->
    <div v-if="!authStore.isAuthenticated" class="auth-required">
      <p>{{ adminContent.authRequired }}</p>
      <router-link to="/login" class="btn btn-success">{{ adminContent.authCta }}</router-link>
    </div>

    <!-- Main Content -->
    <main v-else class="admin-main">
      <div class="container">
        <!-- Loading State -->
        <div v-if="isLoading" class="alert alert-info text-center">
          {{ adminContent.loadingLabel }}
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="alert alert-danger d-flex flex-column align-items-center gap-2">
          <div>{{ error }}</div>
          <button @click="retry" class="btn btn-danger">{{ adminContent.retryLabel }}</button>
        </div>

        <!-- Dashboard -->
        <div v-else>
          <!-- Tabs -->
          <div class="tabs">
            <button
              @click="activeTab = 'dashboard'"
              :class="['tab', { active: activeTab === 'dashboard' }]"
            >
              {{ adminContent.tabDashboard }}
            </button>
            <button
              @click="activeTab = 'milestones'"
              :class="['tab', { active: activeTab === 'milestones' }]"
            >
              {{ adminContent.tabMilestones }} ({{ stats.totalMilestones }})
            </button>
            <button
              @click="activeTab = 'updates'"
              :class="['tab', { active: activeTab === 'updates' }]"
            >
              {{ adminContent.tabUpdates }} ({{ stats.totalUpdates }})
            </button>
          </div>

          <!-- Dashboard Tab -->
          <div v-show="activeTab === 'dashboard'" class="tab-content">
            <div class="row g-3">
              <div class="col-12 col-sm-6 col-lg-3">
                <div class="card shadow-sm h-100">
                  <div class="card-body text-center">
                    <h3 class="text-uppercase small text-muted mb-2">{{ adminContent.statsTitles.totalMilestones }}</h3>
                    <p class="fs-2 fw-bold mb-1">{{ stats.totalMilestones }}</p>
                    <p class="small text-muted mb-0">{{ stats.activeMilestones }} {{ adminContent.statsLabels.activeMilestones }}</p>
                  </div>
                </div>
              </div>
              <div class="col-12 col-sm-6 col-lg-3">
                <div class="card shadow-sm h-100">
                  <div class="card-body text-center">
                    <h3 class="text-uppercase small text-muted mb-2">{{ adminContent.statsTitles.completedMilestones }}</h3>
                    <p class="fs-2 fw-bold mb-0">{{ stats.completedMilestones }}</p>
                  </div>
                </div>
              </div>
              <div class="col-12 col-sm-6 col-lg-3">
                <div class="card shadow-sm h-100">
                  <div class="card-body text-center">
                    <h3 class="text-uppercase small text-muted mb-2">{{ adminContent.statsTitles.totalUpdates }}</h3>
                    <p class="fs-2 fw-bold mb-1">{{ stats.totalUpdates }}</p>
                    <p class="small text-muted mb-0">{{ stats.publishedUpdates }} {{ adminContent.statsLabels.publishedUpdates }}</p>
                  </div>
                </div>
              </div>
              <div class="col-12 col-sm-6 col-lg-3">
                <div class="card shadow-sm h-100">
                  <div class="card-body text-center">
                    <h3 class="text-uppercase small text-muted mb-2">{{ adminContent.statsTitles.status }}</h3>
                    <p class="fs-2 fw-bold text-success mb-0">{{ adminContent.statsLabels.statusOk }}</p>
                  </div>
                </div>
              </div>
            </div>

            <section class="admin-section">
              <h2>{{ adminContent.shortcutsTitle }}</h2>
              <div class="row g-3">
                <div class="col-12 col-sm-6 col-md-4">
                  <button class="btn btn-outline-primary w-100 d-flex flex-column align-items-center gap-2 py-3" @click="activeTab = 'milestones'">
                    <span class="fs-3">????</span>
                    <span class="fw-semibold">{{ adminContent.shortcuts.milestones }}</span>
                  </button>
                </div>
                <div class="col-12 col-sm-6 col-md-4">
                  <button class="btn btn-outline-primary w-100 d-flex flex-column align-items-center gap-2 py-3" @click="activeTab = 'updates'">
                    <span class="fs-3">????</span>
                    <span class="fw-semibold">{{ adminContent.shortcuts.updates }}</span>
                  </button>
                </div>
                <div class="col-12 col-sm-6 col-md-4">
                  <a href="mailto:info@madypack.com.ar" class="btn btn-outline-primary w-100 d-flex flex-column align-items-center gap-2 py-3">
                    <span class="fs-3">????</span>
                    <span class="fw-semibold">{{ adminContent.shortcuts.support }}</span>
                  </a>
                </div>
              </div>

            </section>
          </div>

          <!-- Milestones Tab -->
          <div v-show="activeTab === 'milestones'" class="tab-content">
            <section class="admin-section">
              <h2>{{ adminContent.milestonesTitle }}</h2>
              
              <div v-if="milestones.length === 0" class="empty-message">
                <p>{{ adminContent.milestonesEmpty }}</p>
              </div>
              
              <div v-else class="items-list">
                <div v-for="milestone in milestones" :key="milestone.id" class="item-card">
                  <div class="item-header">
                    <h3>{{ milestone.title }}</h3>
                    <span class="badge" :class="getStatusBadgeClass(milestone.status)">
                      {{ milestone.status }}
                    </span>
                  </div>
                  <p class="item-description">{{ milestone.description }}</p>
                  <div class="item-meta">
                    <span>📅 {{ formatDate(milestone.created_at || '') }}</span>
                    <span>{{ adminContent.milestoneLabels.target }} ${{ milestone.target_amount?.toLocaleString('es-AR') }}</span>
                    <span>{{ adminContent.milestoneLabels.raised }} ${{ milestone.raised_amount?.toLocaleString('es-AR') }}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <!-- Updates Tab -->
          <div v-show="activeTab === 'updates'" class="tab-content">
            <section class="admin-section">
              <h2>{{ adminContent.updatesTitle }}</h2>
              
              <div v-if="updates.length === 0" class="empty-message">
                <p>{{ adminContent.updatesEmpty }}</p>
              </div>
              
              <div v-else class="items-list">
                <div v-for="update in updates" :key="update.id" class="item-card">
                  <div class="item-header">
                    <h3>{{ update.title }}</h3>
                    <span class="badge" :class="getStatusBadgeClass(update.status)">
                      {{ update.status }}
                    </span>
                  </div>
                  <p class="item-description">{{ update.content }}</p>
                  <div class="item-meta">
                    <span>📂 {{ update.category }}</span>
                    <span>📅 {{ formatDate(update.created_at) }}</span>
                    <span v-if="update.published_at">
                      {{ adminContent.updateLabels.published }} {{ formatDate(update.published_at) }}
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


.admin-main {
  padding: 2rem 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
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


.item-description {
  color: #666;
  margin: 0.75rem 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
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

  .badge {
    align-self: flex-start;
  }

  .item-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
