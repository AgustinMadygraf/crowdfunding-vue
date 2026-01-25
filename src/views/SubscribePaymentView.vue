<!--
Path: src/views/SubscribePaymentView.vue
-->

<template>
  <div class="subscribe-payment-container">
    <!-- Header -->
    <div class="payment-header">
      <h1>{{ paymentContent.headerTitle }}</h1>
      <p v-if="user" class="user-greeting">{{ paymentContent.greetingLabel }} {{ user.nombre }}</p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="alert alert-info text-center">
      {{ paymentContent.loadingLabel }}
    </div>

    <!-- Error State -->
    <div v-if="error && !isLoading" class="alert alert-danger d-flex justify-content-between align-items-center flex-wrap gap-2">
      <span>{{ error }}</span>
      <button @click="loadContribution" class="btn btn-danger btn-sm">{{ paymentContent.retryLabel }}</button>
    </div>

    <!-- Contribution Details -->
    <div v-if="contribution && !isLoading" class="card shadow-sm">
      <div class="card-body border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h2>{{ paymentContent.detailsTitle }}</h2>
        <span class="badge" :class="getStatusBadgeClass(contribution.estado_pago)">
          {{ getStatusLabel(contribution.estado_pago) }}
        </span>
      </div>

      <div class="card-body border-bottom">
        <div class="detail-row">
          <span class="label">{{ paymentContent.detailLabels.level }}</span>
          <span class="value">{{ contribution.nivel_nombre }}</span>
        </div>

        <div class="detail-row">
          <span class="label">{{ paymentContent.detailLabels.amount }}</span>
          <span class="value">$ {{ formatAmount(contribution.monto) }}</span>
        </div>

        <div class="detail-row">
          <span class="label">{{ paymentContent.detailLabels.created }}</span>
          <span class="value">{{ formatDate(contribution.created_at) }}</span>
        </div>

        <div v-if="contribution.completed_at" class="detail-row">
          <span class="label">{{ paymentContent.detailLabels.completed }}</span>
          <span class="value">{{ formatDate(contribution.completed_at) }}</span>
        </div>

        <div class="detail-row">
          <span class="label">{{ paymentContent.detailLabels.token }}</span>
          <span class="value token">{{ contribution.token }}</span>
        </div>
      </div>

      <!-- Payment Section -->
      <div class="card-body border-bottom">
        <!-- Pending Payment -->
        <div v-if="contribution.estado_pago === 'pendiente'" class="pending-payment">
          <h3>{{ paymentContent.payment.pendingTitle }}</h3>
          <p>{{ paymentContent.payment.pendingSubtitle }}</p>
          
          <button 
            @click="initiatePayment"
            class="btn btn-primary"
            :disabled="isProcessing"
          >
            {{ isProcessing ? subscribeContent.submitLoadingLabel : paymentContent.payment.pendingButton }}
          </button>
        </div>

        <!-- Processing Payment -->
        <div v-if="contribution.estado_pago === 'procesando'" class="processing-payment">
          <h3>{{ paymentContent.payment.processingTitle }}</h3>
          <p>{{ paymentContent.payment.processingSubtitle }}</p>
          <button @click="loadContribution" class="btn btn-outline-secondary">
            {{ paymentContent.payment.processingButton }}
          </button>
        </div>

        <!-- Completed Payment -->
        <div v-if="contribution.estado_pago === 'completado'" class="completed-payment">
          <h3>{{ paymentContent.payment.completedTitle }}</h3>
          <p>{{ paymentContent.payment.completedSubtitle }}</p>
          <p class="secondary-text">
            {{ paymentContent.payment.completedNote }}
          </p>
        </div>

        <!-- Failed Payment -->
        <div v-if="contribution.estado_pago === 'fallido'" class="failed-payment">
          <h3>{{ paymentContent.payment.failedTitle }}</h3>
          <p>{{ paymentContent.payment.failedSubtitle }}</p>
          <button 
            @click="initiatePayment"
            class="btn btn-primary"
            :disabled="isProcessing"
          >
            {{ isProcessing ? subscribeContent.submitLoadingLabel : paymentContent.payment.failedButton }}
          </button>
        </div>

        <!-- Cancelled Payment -->
        <div v-if="contribution.estado_pago === 'cancelado'" class="cancelled-payment">
          <h3>{{ paymentContent.payment.cancelledTitle }}</h3>
          <p>{{ paymentContent.payment.cancelledSubtitle }}</p>
          <button 
            @click="initiatePayment"
            class="btn btn-primary"
            :disabled="isProcessing"
          >
            {{ isProcessing ? subscribeContent.submitLoadingLabel : paymentContent.payment.cancelledButton }}
          </button>
        </div>
      </div>

      <!-- Info Box -->
      <div class="card-body">
        <div class="alert alert-info mb-0">
          <p class="mb-0">
            <strong>{{ paymentContent.infoHelpTitle }}</strong>
            {{ paymentContent.infoHelpSubtitle }}
          </p>
        </div>
      </div>
    </div>

    <!-- Not Found State -->
    <div v-if="!isLoading && !contribution && !error" class="alert alert-secondary text-center">
      <p class="mb-2">{{ paymentContent.notFoundLabel }}</p>
      <router-link to="/subscribe" class="link">
        {{ paymentContent.notFoundCta }}
      </router-link>
    </div>

    <!-- Unauthenticated Info -->
    <div v-if="showAuthInfo" class="alert alert-light text-center">
      <p class="mb-0">
        {{ paymentContent.authInfoPrefix }}
        <router-link to="/account">{{ paymentContent.authInfoLink }}</router-link>
        {{ paymentContent.authInfoSuffix }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSubscription } from '@/application/useSubscription'
import { useAuthService } from '@/application/useAuthService'
import type { User } from '@/domain/user'
import { content } from '@/infrastructure/content'


interface Contribution {
  id: string
  monto: number
  nivel_nombre: string
  estado_pago: 'pendiente' | 'procesando' | 'completado' | 'fallido' | 'cancelado'
  created_at: string
  completed_at?: string
  token: string
  mercadopago_preference_id?: string
}

const route = useRoute()
const subscriptionService = useSubscription()
const paymentContent = content.subscribePaymentView
const subscribeContent = content.subscribeView

// State
const user = ref<User | null>(null)
const contribution = ref<Contribution | null>(null)
const isLoading = ref(false)
const isProcessing = ref(false)
const error = ref<string | null>(null)

const token = computed(() => route.params.token as string)
const showAuthInfo = computed(() => !user.value && contribution.value)

/**
 * Carga la información de la contribución
 */
const loadContribution = async () => {
  // Validar token antes de fetch
  if (!token.value?.trim()) {
    error.value = paymentContent.errors.emptyToken
    console.error('[SubscribePayment] ❌ Token vacío')
    return
  }

  isLoading.value = true
  error.value = null

  try {

    const result = await subscriptionService.loadContributionByToken(token.value)
    
    if (result) {
      contribution.value = result as Contribution
    } else {
      error.value = subscriptionService.error.value || paymentContent.errors.loadContribution
      console.error('[SubscribePayment] ❌ Contribución null o error en service:')
      console.error('[SubscribePayment]   Service error:', subscriptionService.error.value)
    }
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Error desconocido'
    error.value = errMsg
    console.error('[SubscribePayment] ❌ Exception cargando contribución:')
    console.error('[SubscribePayment]   Mensaje:', errMsg)
    console.error('[SubscribePayment]   Error completo:', err)
    console.error('[SubscribePayment]   Stack:', err instanceof Error ? err.stack : 'N/A')
  } finally {
    isLoading.value = false
  }
}

/**
 * Inicia el proceso de pago en MercadoPago
 */
const initiatePayment = async () => {
  if (!contribution.value?.mercadopago_preference_id) {
    error.value = paymentContent.errors.paymentInfo
    return
  }

  isProcessing.value = true

  try {
    // Redirigir a MercadoPago
    const mp = (window as any).MercadoPago
    if (mp) {
      mp.redirect(contribution.value.mercadopago_preference_id)
    } else {
      // Si no está disponible el SDK, usar URL de MercadoPago directa
      window.location.href = `https://www.mercadopago.com/checkout/v1/redirect?preference-id=${contribution.value.mercadopago_preference_id}`
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : paymentContent.errors.paymentInit
    console.error('[SubscribePayment] Error initiating payment:', err)
  } finally {
    isProcessing.value = false
  }
}

/**
 * Obtiene la etiqueta de estado
 */
const getStatusLabel = (status: string): string => {
  return paymentContent.statusLabels[status] || status
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
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusBadgeClass = (status: string) => {
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
 * Carga usuario actual si está autenticado
 */
onMounted(() => {
  const auth = useAuthService()
  user.value = auth.getCurrentUser()
  loadContribution()
})
</script>

<style scoped lang="css">
.subscribe-payment-container {
  max-width: 700px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.payment-header {
  text-align: center;
  margin-bottom: 2rem;
}

.payment-header h1 {
  font-size: 2rem;
  margin: 0 0 0.5rem;
  color: var(--color-text);
}

.user-greeting {
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.not-found .link {
  color: var(--color-primary);
  text-decoration: none;
  margin-top: 1rem;
  display: inline-block;
}

.card-body h2 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--color-text);
}


.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-row:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: var(--color-text-secondary);
}

.value {
  color: var(--color-text);
  text-align: right;
}

.value.token {
  font-family: monospace;
  font-size: 0.875rem;
  background: #f5f5f5;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.pending-payment,
.processing-payment,
.completed-payment,
.failed-payment,
.cancelled-payment {
  text-align: center;
}

.payment-section h3 {
  margin: 0 0 0.5rem;
  color: var(--color-text);
}

.payment-section p {
  margin: 0.5rem 0;
  color: var(--color-text-secondary);
}

.secondary-text {
  font-size: 0.875rem;
  color: #999;
}


.completed-payment {
  background: #d4edda;
  padding: 1.5rem;
  border-radius: 0.5rem;
  color: #155724;
}

.failed-payment {
  background: #f8d7da;
  padding: 1.5rem;
  border-radius: 0.5rem;
  color: #721c24;
}

.cancelled-payment {
  background: #fff3cd;
  padding: 1.5rem;
  border-radius: 0.5rem;
  color: #856404;
}

.auth-info a {
  color: var(--color-primary);
  text-decoration: none;
}

.auth-info a:hover {
  text-decoration: underline;
}
</style>
