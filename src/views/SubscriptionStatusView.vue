<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSubscription } from '@/application/useSubscription'
import { content } from '@/infrastructure/content'


const route = useRoute()
const router = useRouter()

const contributionId = computed(() => route.params.id as string)
const { isLoading, error, loadContributionByToken } = useSubscription()
const statusContent = content.subscriptionStatusView

// Contribution data
const contribution = ref<{
  id: string
  monto: number
  nivel_nombre: string
  estado_pago: 'pendiente' | 'procesando' | 'completado' | 'fallido' | 'cancelado'
  created_at: string
  completed_at?: string
  token: string
  mercadopago_preference_id?: string
} | null>(null)

// Map payment status to display labels
const statusLabels: Record<string, string> = statusContent.statusLabels

const statusColors: Record<string, string> = {
  pendiente: '#f39c12',
  procesando: '#3498db',
  completado: '#42b983',
  fallido: '#e74c3c',
  cancelado: '#95a5a6'
}

const loadContribution = async () => {
  // Validar token antes de fetch
  if (!contributionId.value?.trim()) {
    error.value = statusContent.errors.emptyId
    return
  }
  try {
    const result = await loadContributionByToken(contributionId.value)
    contribution.value = result
    if (import.meta.env.DEV && result) {
    }
  } catch (err) {
    console.error('[SubscriptionStatus] ? Error:', err)
    console.error('Error obteniendo estado de suscripci?n', err)
  }
}

const retry = () => {
  loadContribution()
}

onMounted(() => {
  loadContribution()
})
</script>

<template>
  <div class="subscription-status-view">
    <section class="hero-section">
      <div class="container">
        <h1>{{ statusContent.heroTitle }}</h1>
        <p class="subtitle" v-if="contributionId">{{ statusContent.idLabel }} {{ contributionId }}</p>
      </div>
    </section>

    <!-- Loading State -->
    <section v-if="isLoading" class="status-section">
      <div class="container">
        <div class="status-card loading">
          <p>{{ statusContent.loadingLabel }}</p>
        </div>
      </div>
    </section>

    <!-- Error State -->
    <section v-else-if="error && !contribution" class="status-section">
      <div class="container">
        <div class="status-card error">
          <h2>{{ statusContent.errorTitle }}</h2>
          <p>{{ error }}</p>
          <div class="actions">
            <button @click="retry" class="btn btn-primary">{{ statusContent.retryLabel }}</button>
            <router-link to="/" class="btn btn-secondary">{{ statusContent.backHomeLabel }}</router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Success State -->
    <section v-else-if="contribution" class="status-section">
      <div class="container">
        <div class="status-card">
          <div class="status-header">
            <h2>{{ statusContent.statusTitle }}</h2>
            <span
              class="badge rounded-pill text-white"
              :style="{ backgroundColor: statusColors[contribution.estado_pago] }"
            >
              {{ statusLabels[contribution.estado_pago] }}
            </span>
          </div>

          <div class="status-details">
            <div class="detail-row">
              <span class="label">{{ statusContent.detailLabels.level }}</span>
              <span class="value">{{ contribution.nivel_nombre }}</span>
            </div>
            <div class="detail-row">
              <span class="label">{{ statusContent.detailLabels.amount }}</span>
              <span class="value">${{ contribution.monto.toLocaleString('es-AR') }}</span>
            </div>
            <div class="detail-row">
              <span class="label">{{ statusContent.detailLabels.created }}</span>
              <span class="value">{{
                new Date(contribution.created_at).toLocaleDateString('es-AR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              }}</span>
            </div>
            <div v-if="contribution.completed_at" class="detail-row">
              <span class="label">{{ statusContent.detailLabels.completed }}</span>
              <span class="value">{{
                new Date(contribution.completed_at).toLocaleDateString('es-AR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              }}</span>
            </div>
            <div class="detail-row">
              <span class="label">{{ statusContent.detailLabels.token }}</span>
              <span class="value token">{{ contribution.token }}</span>
            </div>
          </div>

          <div class="status-explanation">
            <h3>{{ statusContent.explanationTitle }}</h3>
            <p v-if="contribution.estado_pago === 'pendiente'">
              {{ statusContent.explanations.pendiente }}
            </p>
            <p v-else-if="contribution.estado_pago === 'procesando'">
              {{ statusContent.explanations.procesando }}
            </p>
            <p v-else-if="contribution.estado_pago === 'completado'">
              {{ statusContent.explanations.completado }}
            </p>
            <p v-else-if="contribution.estado_pago === 'fallido'">
              {{ statusContent.explanations.fallido }}
            </p>
            <p v-else-if="contribution.estado_pago === 'cancelado'">
              {{ statusContent.explanations.cancelado }}
            </p>
          </div>

          <div class="actions">
            <router-link
              v-if="contribution.estado_pago === 'pendiente'"
              :to="`/suscribir/pago/${contribution.token}`"
              class="btn btn-primary"
            >
              {{ statusContent.actions.completePayment }}
            </router-link>
            <button v-if="contribution.estado_pago === 'procesando'" @click="retry" class="btn btn-primary">
              {{ statusContent.actions.refreshStatus }}
            </button>
            <router-link to="/" class="btn btn-secondary">{{ statusContent.backHomeLabel }}</router-link>
            <a href="mailto:info@madypack.com.ar" class="btn btn-secondary">{{ statusContent.actions.contactSupport }}</a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.subscription-status-view {
  display: flex;
  flex-direction: column;
  gap: 0;
  min-height: 80vh;
}

.hero-section {
  padding: 80px 20px 40px;
  background: linear-gradient(135deg, #42b983 0%, #2c3e50 100%);
  color: white;
  text-align: center;
}

.container {
  max-width: 960px;
  margin: 0 auto;
}

.hero-section h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.subtitle {
  font-size: 1rem;
  opacity: 0.8;
  font-family: monospace;
}

.status-section {
  padding: 80px 20px;
  background-color: #f5f5f5;
}

.status-card {
  background: white;
  border-radius: 8px;
  padding: 3rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-card.loading,
.status-card.error {
  text-align: center;
  padding: 4rem 3rem;
}

.status-card.error {
  border: 2px solid #e74c3c;
}

.status-card.error h2 {
  color: #e74c3c;
  margin-bottom: 1rem;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e0e0e0;
}

.status-header h2 {
  font-size: 1.5rem;
  color: #2c3e50;
}


.status-details {
  margin-bottom: 2rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-row:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #666;
}

.value {
  color: #2c3e50;
}

.value.token {
  font-family: monospace;
  font-size: 0.875rem;
  word-break: break-all;
}

.status-explanation {
  background: #f5f5f5;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.status-explanation h3 {
  font-size: 1.25rem;
  color: #2c3e50;
  margin-bottom: 0.75rem;
}

.status-explanation p {
  color: #666;
  line-height: 1.6;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .status-card {
    padding: 2rem 1.5rem;
  }

  .status-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .detail-row {
    flex-direction: column;
    gap: 0.5rem;
  }

  .actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    text-align: center;
  }
}
</style>
