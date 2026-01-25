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
      <button @click="handleLogout" class="logout-button">
        {{ dashboardContent.logoutLabel }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading">
      <p>{{ dashboardContent.loadingLabel }}</p>
    </div>

    <!-- Error State -->
    <div v-if="error && !isLoading" class="error-banner">
      {{ error }}
      <button @click="loadContributions" class="retry-btn">{{ dashboardContent.retryLabel }}</button>
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
          class="contribution-item"
        >
          <div class="contribution-header">
            <div>
              <h3>{{ contribution.nivel_nombre }}</h3>
              <p class="contribution-date">
                {{ formatDate(contribution.created_at) }}
              </p>
            </div>
            <div class="contribution-amount">
              $ {{ formatAmount(contribution.monto) }}
            </div>
          </div>

          <div class="contribution-body">
            <div class="status-row">
              <span class="status-label">{{ dashboardContent.statusLabel }}</span>
              <span :class="['status-badge', `status-${contribution.estado_pago}`]">
                {{ getStatusLabel(contribution.estado_pago) }}
              </span>
            </div>

            <div v-if="contribution.completed_at" class="completion-date">
              {{ dashboardContent.completedAtLabel }} {{ formatDate(contribution.completed_at) }}
            </div>
          </div>

          <div class="contribution-actions">
            <router-link 
              :to="`/suscribir/${contribution.token}`"
              class="view-link"
            >
              {{ dashboardContent.viewDetailsLabel }}
            </router-link>

            <button 
              v-if="contribution.estado_pago === 'pendiente' || contribution.estado_pago === 'fallido'"
              @click="goToPayment(contribution.token)"
              class="pay-button"
            >
              {{ dashboardContent.payLabel }}
            </button>
          </div>
        </div>
      </div>

      <div class="stats-summary">
        <div class="stat">
          <span class="stat-label">{{ dashboardContent.totalContributedLabel }}</span>
          <span class="stat-value">${{ formatAmount(getTotalContributed()) }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">{{ dashboardContent.completedPaymentsLabel }}</span>
          <span class="stat-value">{{ getCompletedCount() }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">{{ dashboardContent.pendingPaymentsLabel }}</span>
          <span class="stat-value">{{ getPendingCount() }}</span>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!isLoading && contributions.length === 0 && !error" class="empty-state">
      <h2>{{ dashboardContent.emptyTitle }}</h2>
      <p>{{ dashboardContent.emptySubtitle }}</p>
      <router-link to="/suscribir" class="primary-button">
        {{ dashboardContent.emptyCta }}
      </router-link>
    </div>

    <!-- New Contribution Button -->
    <div v-if="contributions.length > 0" class="actions-footer">
      <router-link to="/suscribir" class="secondary-button">
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

.logout-button {
  padding: 0.75rem 1.5rem;
  background: #c00;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.2s;
}

.logout-button:hover {
  background: #a00;
}

.loading,
.error-banner {
  padding: 1.5rem;
  border-radius: 0.5rem;
  text-align: center;
  margin-bottom: 1rem;
}

.loading {
  background: var(--color-background-soft);
  color: var(--color-text-secondary);
}

.error-banner {
  background: #fee;
  border: 1px solid #fcc;
  color: #c00;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.retry-btn {
  padding: 0.5rem 1rem;
  background: #c00;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.retry-btn:hover {
  background: #a00;
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

.contribution-item {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.contribution-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.contribution-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: var(--color-background-soft);
  border-bottom: 1px solid #eee;
}

.contribution-header h3 {
  margin: 0;
  color: var(--color-text);
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

.contribution-body {
  padding: 1.5rem;
}

.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.status-label {
  color: var(--color-text-secondary);
  font-weight: 600;
}

.status-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-pendiente {
  background: #fef3cd;
  color: #856404;
}

.status-procesando {
  background: #d1ecf1;
  color: #0c5460;
}

.status-completado {
  background: #d4edda;
  color: #155724;
}

.status-fallido {
  background: #f8d7da;
  color: #721c24;
}

.status-cancelado {
  background: #fff3cd;
  color: #856404;
}

.completion-date {
  font-size: 0.875rem;
  color: #27ae60;
  margin-top: 0.5rem;
}

.contribution-actions {
  padding: 1rem 1.5rem 1.5rem;
  background: #f9f9f9;
  border-top: 1px solid #eee;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.view-link,
.pay-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.875rem;
  text-decoration: none;
  transition: all 0.2s;
}

.view-link {
  background: var(--color-background-soft);
  color: var(--color-text);
  border: 1px solid #ddd;
}

.view-link:hover {
  background: #e8e8e8;
}

.pay-button {
  background: #009ee3;
  color: white;
}

.pay-button:hover {
  background: #007ab8;
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat {
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.5rem;
}

.stat-value {
  display: block;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-primary);
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  background: var(--color-background-soft);
  border-radius: 0.5rem;
}

.empty-state h2 {
  margin: 0 0 0.5rem;
  color: var(--color-text);
}

.empty-state p {
  color: var(--color-text-secondary);
  margin: 0 0 1.5rem;
}

.primary-button,
.secondary-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  text-decoration: none;
  transition: all 0.2s;
  display: inline-block;
}

.primary-button {
  background: var(--color-primary);
  color: white;
}

.primary-button:hover {
  opacity: 0.9;
}

.secondary-button {
  background: var(--color-background-soft);
  color: var(--color-text);
  border: 1px solid #ddd;
}

.secondary-button:hover {
  background: #e8e8e8;
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

  .logout-button {
    align-self: flex-start;
  }

  .contribution-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .contribution-amount {
    align-self: flex-end;
  }

  .status-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .contribution-actions {
    flex-direction: column;
  }

  .view-link,
  .pay-button {
    width: 100%;
    text-align: center;
  }
}
</style>
