<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="dashboard-header">
      <div class="header-content">
        <img 
          v-if="user?.avatar_url"
          :src="sanitizeAvatarUrl(user.avatar_url)"
          :alt="user?.nombre"
          class="avatar"
        >
        <div>
          <h1>{{ dashboardContent.title }}</h1>
          <p class="greeting">{{ dashboardContent.greetingLabel }} {{ user?.nombre }}</p>
          <p class="email">{{ user?.email }}</p>
        </div>
      </div>
      <button @click="handleLogout" class="btn btn-danger">
        {{ dashboardContent.logoutLabel }}
      </button>
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
      <h2>{{ dashboardContent.contributionsTitle }}</h2>
      <p class="subtitle">
        {{ dashboardContent.contributionsPrefix }} {{ contributions.length }} 
        {{ contributions.length === 1 ? dashboardContent.contributionsSingle : dashboardContent.contributionsPlural }}
      </p>

      <div class="contributions-list">
        <div 
          v-for="contribution in contributions"
          :key="contribution.id"
          class="card shadow-sm"
        >
          <div class="card-body d-flex flex-column gap-3">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <h3 class="h5 mb-1">{{ contribution.nivel_nombre }}</h3>
                <p class="contribution-date mb-0">
                  {{ formatDate(contribution.created_at) }}
                </p>
              </div>
              <div class="contribution-amount">
                $ {{ formatAmount(contribution.monto) }}
              </div>
            </div>
            <div class="contribution-body p-0">
              <div class="status-row d-flex justify-content-between align-items-center flex-wrap gap-2">
                <span class="status-label">{{ dashboardContent.statusLabel }}</span>
                <span class="badge" :class="getStatusBadgeClass(contribution.estado_pago)">
                  {{ getStatusLabel(contribution.estado_pago) }}
                </span>
              </div>
              <div v-if="contribution.completed_at" class="completion-date">
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
    <div v-if="contributions.length > 0" class="actions-footer text-center">
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

<style scoped lang="css">
.dashboard-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--color-background-soft);
  border-radius: 0.5rem;
}

.header-content {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.dashboard-header h1 {
  margin: 0;
  font-size: 1.75rem;
  color: var(--color-text);
}

.greeting {
  margin: 0.5rem 0 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
}

.email {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}



.contributions-section h2 {
  font-size: 1.5rem;
  margin: 2rem 0 0.5rem;
  color: var(--color-text);
}

.subtitle {
  color: var(--color-text-secondary);
  margin: 0 0 1.5rem;
}

.contributions-list {
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
}

.contribution-date {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.contribution-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: #27ae60;
}

.status-label {
  color: var(--color-text-secondary);
  font-weight: 600;
}


.completion-date {
  font-size: 0.875rem;
  color: #27ae60;
  margin-top: 0.5rem;
}



.actions-footer {
  padding: 1rem;
  text-align: center;
  border-top: 1px solid #eee;
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
  }

  .header-content {
    width: 100%;
  }


}
</style>
