<!--
Path: src/views/AdminView.vue
-->

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { content } from '@/presentation/content'
import { useAdminData } from '@/presentation/composables/useAdminData'


const router = useRouter()
const authStore = useAuthStore()
const adminContent = content.adminView
const adminData = useAdminData()

// State
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
  await adminData.loadData()
}

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
        <div v-if="adminData.isLoading.value" class="alert alert-info text-center">
          {{ adminContent.loadingLabel }}
        </div>

        <!-- Error State -->
        <div v-else-if="adminData.error.value" class="alert alert-danger d-flex flex-column align-items-center gap-2">
          <div>{{ adminData.error.value }}</div>
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
              {{ adminContent.tabMilestones }} ({{ adminData.stats.value.totalMilestones }})
            </button>
            <button
              type="button"
              @click="activeTab = 'updates'"
              :class="['nav-link', { active: activeTab === 'updates' }]"
            >
              {{ adminContent.tabUpdates }} ({{ adminData.stats.value.totalUpdates }})
            </button>
          </div>

          <!-- Dashboard Tab -->
          <div v-show="activeTab === 'dashboard'" class="tab-content">
            <div class="row g-3">
              <div class="col-12 col-sm-6 col-lg-3">
                <div class="card shadow-sm h-100">
                  <div class="card-body text-center">
                    <h3 class="text-uppercase small text-muted mb-2">{{ adminContent.statsTitles.totalMilestones }}</h3>
                    <p class="fs-2 fw-bold mb-1">{{ adminData.stats.value.totalMilestones }}</p>
                    <p class="small text-muted mb-0">{{ adminData.stats.value.activeMilestones }} {{ adminContent.statsLabels.activeMilestones }}</p>
                  </div>
                </div>
              </div>
              <div class="col-12 col-sm-6 col-lg-3">
                <div class="card shadow-sm h-100">
                  <div class="card-body text-center">
                    <h3 class="text-uppercase small text-muted mb-2">{{ adminContent.statsTitles.completedMilestones }}</h3>
                    <p class="fs-2 fw-bold mb-0">{{ adminData.stats.value.completedMilestones }}</p>
                  </div>
                </div>
              </div>
              <div class="col-12 col-sm-6 col-lg-3">
                <div class="card shadow-sm h-100">
                  <div class="card-body text-center">
                    <h3 class="text-uppercase small text-muted mb-2">{{ adminContent.statsTitles.totalUpdates }}</h3>
                    <p class="fs-2 fw-bold mb-1">{{ adminData.stats.value.totalUpdates }}</p>
                    <p class="small text-muted mb-0">{{ adminData.stats.value.publishedUpdates }} {{ adminContent.statsLabels.publishedUpdates }}</p>
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
                <div v-if="adminData.milestones.value.length === 0" class="text-center text-muted fst-italic py-4">
                  <p class="mb-0">{{ adminContent.milestonesEmpty }}</p>
                </div>
                <div v-else class="d-grid gap-3">
                  <div v-for="milestone in adminData.milestones.value" :key="milestone.id" class="card">
                    <div class="card-body">
                      <div class="d-flex justify-content-between align-items-start gap-3">
                        <h3 class="h6 mb-0">{{ milestone.title }}</h3>
                        <span class="badge" :class="getStatusBadgeClass(milestone.status)">
                          {{ milestone.status }}
                        </span>
                      </div>
                      <p class="text-muted small my-3 text-truncate-2">{{ milestone.description }}</p>
                      <div class="d-flex flex-wrap gap-3 small text-muted border-top pt-2">
                        <span>{{ formatDate(milestone.createdAt) }}</span>
                        <span>{{ adminContent.milestoneLabels.target }} ${{ milestone.targetAmount?.toLocaleString('es-AR') }}</span>
                        <span>{{ adminContent.milestoneLabels.raised }} ${{ milestone.raisedAmount?.toLocaleString('es-AR') }}</span>
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
                <div v-if="adminData.updates.value.length === 0" class="text-center text-muted fst-italic py-4">
                  <p class="mb-0">{{ adminContent.updatesEmpty }}</p>
                </div>
                <div v-else class="d-grid gap-3">
                  <div v-for="update in adminData.updates.value" :key="update.id" class="card">
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
                        <span>{{ formatDate(update.createdAt) }}</span>
                        <span v-if="update.publishedAt">
                          {{ adminContent.updateLabels.published }} {{ formatDate(update.publishedAt) }}
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

