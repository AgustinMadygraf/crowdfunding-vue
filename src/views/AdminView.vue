<!--
Path: src/views/AdminView.vue
-->

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { milestonesRepository, MilestoneRepositoryError } from '@/infrastructure/repositories/MilestonesRepository'
import { updatesRepository, UpdateRepositoryError } from '@/infrastructure/repositories/UpdatesRepository'
import type { MilestoneDTO, UpdateDTO } from '@/infrastructure/dto'
import { content } from '@/presentation/content'


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
  <div class="min-vh-100 bg-light">
    <!-- Header -->
    <header class="bg-dark text-white py-3 shadow-sm">
      <div class="container d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
        <h1 class="h4 mb-0">{{ adminContent.title }}</h1>
        <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-2">
          <span class="small text-white-50">{{ authStore.user?.nombre || authStore.user?.email }}</span>
          <button @click="handleLogout" class="btn btn-danger btn-sm">{{ adminContent.logoutLabel }}</button>
        </div>
      </div>
    </header>

    <!-- Auth Check Message -->
    <div v-if="!authStore.isAuthenticated" class="container my-4">
      <div class="alert alert-danger text-center">
      <p class="mb-3">{{ adminContent.authRequired }}</p>
      <router-link to="/login" class="btn btn-success">{{ adminContent.authCta }}</router-link>
      </div>
    </div>

    <!-- Main Content -->
    <main v-else class="py-4">
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
          <div class="nav nav-tabs mb-4">
            <button
              type="button"
              @click="activeTab = 'dashboard'"
              :class="['nav-link', { active: activeTab === 'dashboard' }]"
            >
              {{ adminContent.tabDashboard }}
            </button>
            <button
              type="button"
              @click="activeTab = 'milestones'"
              :class="['nav-link', { active: activeTab === 'milestones' }]"
            >
              {{ adminContent.tabMilestones }} ({{ stats.totalMilestones }})
            </button>
            <button
              type="button"
              @click="activeTab = 'updates'"
              :class="['nav-link', { active: activeTab === 'updates' }]"
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

            <section class="card shadow-sm mb-4 mt-4">
              <div class="card-body">
                <h2 class="h5 mb-3">{{ adminContent.shortcutsTitle }}</h2>
                <div class="row g-3">
                  <div class="col-12 col-sm-6 col-md-4">
                    <button class="btn btn-outline-primary w-100 d-flex flex-column align-items-center gap-2 py-3" @click="activeTab = 'milestones'">
                      <span class="fw-semibold">{{ adminContent.shortcuts.milestones }}</span>
                    </button>
                  </div>
                  <div class="col-12 col-sm-6 col-md-4">
                    <button class="btn btn-outline-primary w-100 d-flex flex-column align-items-center gap-2 py-3" @click="activeTab = 'updates'">
                      <span class="fw-semibold">{{ adminContent.shortcuts.updates }}</span>
                    </button>
                  </div>
                  <div class="col-12 col-sm-6 col-md-4">
                    <a href="mailto:info@madypack.com.ar" class="btn btn-outline-primary w-100 d-flex flex-column align-items-center gap-2 py-3">
                      <span class="fw-semibold">{{ adminContent.shortcuts.support }}</span>
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </div>
          <!-- Milestones Tab -->
          <div v-show="activeTab === 'milestones'" class="tab-content">
            <section class="card shadow-sm mb-4">
              <div class="card-body">
                <h2 class="h5 mb-3">{{ adminContent.milestonesTitle }}</h2>
                <div v-if="milestones.length === 0" class="text-center text-muted fst-italic py-4">
                  <p class="mb-0">{{ adminContent.milestonesEmpty }}</p>
                </div>
                <div v-else class="d-grid gap-3">
                  <div v-for="milestone in milestones" :key="milestone.id" class="card">
                    <div class="card-body">
                      <div class="d-flex justify-content-between align-items-start gap-3">
                        <h3 class="h6 mb-0">{{ milestone.title }}</h3>
                        <span class="badge" :class="getStatusBadgeClass(milestone.status)">
                          {{ milestone.status }}
                        </span>
                      </div>
                      <p class="text-muted small my-3 text-truncate-2">{{ milestone.description }}</p>
                      <div class="d-flex flex-wrap gap-3 small text-muted border-top pt-2">
                        <span>{{ formatDate(milestone.created_at || '') }}</span>
                        <span>{{ adminContent.milestoneLabels.target }} ${{ milestone.target_amount?.toLocaleString('es-AR') }}</span>
                        <span>{{ adminContent.milestoneLabels.raised }} ${{ milestone.raised_amount?.toLocaleString('es-AR') }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
          <!-- Updates Tab -->
          <div v-show="activeTab === 'updates'" class="tab-content">
            <section class="card shadow-sm mb-4">
              <div class="card-body">
                <h2 class="h5 mb-3">{{ adminContent.updatesTitle }}</h2>
                <div v-if="updates.length === 0" class="text-center text-muted fst-italic py-4">
                  <p class="mb-0">{{ adminContent.updatesEmpty }}</p>
                </div>
                <div v-else class="d-grid gap-3">
                  <div v-for="update in updates" :key="update.id" class="card">
                    <div class="card-body">
                      <div class="d-flex justify-content-between align-items-start gap-3">
                        <h3 class="h6 mb-0">{{ update.title }}</h3>
                        <span class="badge" :class="getStatusBadgeClass(update.status)">
                          {{ update.status }}
                        </span>
                      </div>
                      <p class="text-muted small my-3 text-truncate-2">{{ update.content }}</p>
                      <div class="d-flex flex-wrap gap-3 small text-muted border-top pt-2">
                        <span>{{ update.category }}</span>
                        <span>{{ formatDate(update.created_at) }}</span>
                        <span v-if="update.published_at">
                          {{ adminContent.updateLabels.published }} {{ formatDate(update.published_at) }}
                        </span>
                      </div>
                    </div>
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

