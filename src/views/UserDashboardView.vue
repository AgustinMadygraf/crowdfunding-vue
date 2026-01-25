<!--
Path: src/views/UserDashboardView.vue
-->

<template>
  <div class="container py-4">
    <!-- Header -->
    <div class="card shadow-sm mb-4">
      <div class="card-body d-flex justify-content-between align-items-start flex-wrap gap-3">
        <div class="d-flex gap-3 align-items-center">
        <img 
          v-if="user?.avatar_url"
          :src="sanitizeAvatarUrl(user.avatar_url)"
          :alt="user?.nombre"
          class="rounded-circle"
          width="80"
          height="80"
        >
        <div>
          <h1 class="h3 mb-1">{{ dashboardContent.title }}</h1>
          <p class="fw-semibold mb-0">{{ dashboardContent.greetingLabel }} {{ user?.nombre }}</p>
          <p class="text-muted mb-0">{{ user?.email }}</p>
        </div>
      </div>
      <button @click="handleLogout" class="btn btn-danger">
        {{ dashboardContent.logoutLabel }}
      </button>
    </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="alert alert-info text-center">
      {{ dashboardContent.loadingLabel }}
    </div>

    <!-- Error State -->
    <div v-if="error && !isLoading" class="alert alert-danger d-flex justify-content-between align-items-center flex-wrap gap-2">
      <span>{{ error }}</span>
      <button @click="loadContributions" class="btn btn-danger btn-sm">{{ dashboardContent.retryLabel }}</button>
    </div>

    <!-- Contributions Section -->
    <div v-if="!isLoading && contributions.length > 0" class="contributions-section">
      <h2 class="h4 mb-2">{{ dashboardContent.contributionsTitle }}</h2>
      <p class="text-muted mb-3">
        {{ dashboardContent.contributionsPrefix }} {{ contributions.length }} 
        {{ contributions.length === 1 ? dashboardContent.contributionsSingle : dashboardContent.contributionsPlural }}
      </p>

      <div class="d-grid gap-3 mb-4">
        <div 
          v-for="contribution in contributions"
          :key="contribution.id"
          class="card shadow-sm"
        >
          <div class="card-body d-flex flex-column gap-3">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <h3 class="h5 mb-1">{{ contribution.nivel_nombre }}</h3>
                <p class="text-muted small mb-0">
                  {{ formatDate(contribution.created_at) }}
                </p>
              </div>
              <div class="fs-4 fw-bold text-success">
                $ {{ formatAmount(contribution.monto) }}
              </div>
            </div>
            <div class="contribution-body p-0">
              <div class="status-row d-flex justify-content-between align-items-center flex-wrap gap-2">
                <span class="text-muted fw-semibold">{{ dashboardContent.statusLabel }}</span>
                <span class="badge" :class="getStatusBadgeClass(contribution.estado_pago)">
                  {{ getStatusLabel(contribution.estado_pago) }}
                </span>
              </div>
              <div v-if="contribution.completed_at" class="small text-success mt-2">
                {{ dashboardContent.completedAtLabel }} {{ formatDate(contribution.completed_at) }}
              </div>
            </div>
            <div class="contribution-actions d-flex gap-2 justify-content-end flex-wrap">
              <router-link 
                :to="`/suscribir/${contribution.token}`"
                class="btn btn-outline-secondary"
              >
                {{ dashboardContent.viewDetailsLabel }}
              </router-link>

              <button 
                v-if="contribution.estado_pago === 'pendiente' || contribution.estado_pago === 'fallido'"
                @click="goToPayment(contribution.token)"
                class="btn btn-primary"
              >
                {{ dashboardContent.payLabel }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-3">
        <div class="col-12 col-md-4">
          <div class="card shadow-sm text-center">
            <div class="card-body">
              <span class="small text-muted d-block mb-1">{{ dashboardContent.totalContributedLabel }}</span>
              <span class="fs-4 fw-bold text-primary">${{ formatAmount(getTotalContributed()) }}</span>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="card shadow-sm text-center">
            <div class="card-body">
              <span class="small text-muted d-block mb-1">{{ dashboardContent.completedPaymentsLabel }}</span>
              <span class="fs-4 fw-bold text-primary">{{ getCompletedCount() }}</span>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="card shadow-sm text-center">
            <div class="card-body">
              <span class="small text-muted d-block mb-1">{{ dashboardContent.pendingPaymentsLabel }}</span>
              <span class="fs-4 fw-bold text-primary">{{ getPendingCount() }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!isLoading && contributions.length === 0 && !error" class="text-center py-5">
      <h2>{{ dashboardContent.emptyTitle }}</h2>
      <p class="text-muted">{{ dashboardContent.emptySubtitle }}</p>
      <router-link to="/suscribir" class="btn btn-primary">
        {{ dashboardContent.emptyCta }}
      </router-link>
    </div>

    <!-- New Contribution Button -->
    <div v-if="contributions.length > 0" class="border-top pt-3 text-center">
      <router-link to="/suscribir" class="btn btn-outline-secondary">
        {{ dashboardContent.newContributionLabel }}
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthService } from '@/application/useAuthService'
import { useSubscription } from '@/application/useSubscription'
import { content } from '@/infrastructure/content'
import type { UserContribution } from '@/application/ports/ContributionsRepository'
import type { User } from '@/domain/user'
import { sanitizeAvatarUrl } from '@/utils/urlSanitizer'


const router = useRouter()
const auth = useAuthService()
const dashboardContent = content.userDashboardView

// State
const user = ref<User | null>(null)
const contributions = ref<UserContribution[]>([])
const { isLoading, error, loadUserContributions } = useSubscription()

/**
 * Carga las contribuciones del usuario
 */
const loadContributions = async () => {
  if (!user.value) {
    return
  }
  const list = await loadUserContributions(user.value.id)
  contributions.value = list

  // Ordenar por fecha mas reciente primero
  contributions.value.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

/**
 * Obtiene la etiqueta de estado
 */
const getStatusLabel = (status: string): string => {
  return dashboardContent.statusLabels[status] || status
}

const getStatusBadgeClass = (status: string): string => {
  const map: Record<string, string> = {
    pendiente: 'text-bg-warning',
    procesando: 'text-bg-info',
    completado: 'text-bg-success',
    fallido: 'text-bg-danger',
    cancelado: 'text-bg-secondary'
  }
  return map[status] || 'text-bg-secondary'
}

/**
 * Formatea un monto
 */
const formatAmount = (amount: number): string => {
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/**
 * Formatea una fecha
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Calcula el total de contribuciones completadas
 */
const getTotalContributed = (): number => {
  return contributions.value
    .filter(c => c.estado_pago === 'completado')
    .reduce((sum, c) => sum + c.monto, 0)
}

/**
 * Cuenta contribuciones completadas
 */
const getCompletedCount = (): number => {
  return contributions.value.filter(c => c.estado_pago === 'completado').length
}

/**
 * Cuenta contribuciones pendientes
 */
const getPendingCount = (): number => {
  return contributions.value.filter(
    c => c.estado_pago === 'pendiente' || c.estado_pago === 'fallido'
  ).length
}

/**
 * Navega a la página de pago
 */
const goToPayment = (token: string) => {
  router.push(`/suscribir/${token}`)
}

/**
 * Maneja el logout
 */
const handleLogout = () => {
  auth.logout()
  router.push('/')
}

/**
 * Inicializa el dashboard
 */
onMounted(() => {
  user.value = auth.getCurrentUser()
  
  if (!user.value) {
    router.push('/')
    return
  }

  loadContributions()
})

const fetchUserData = async () => {
  try {
    user.value = auth.getCurrentUser()
    
    if (!user.value) {
      router.push('/')
      return
    }

    loadContributions()
  } catch (err) {
    console.error('Error obteniendo datos de usuario', err)
    error.value = err instanceof Error ? err.message : dashboardContent.errors.userLoad
    isLoading.value = false
  }
}
</script>

