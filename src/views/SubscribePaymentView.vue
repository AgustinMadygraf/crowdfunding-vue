<!--
Path: src/views/SubscribePaymentView.vue
-->

<template>
  <div class="container py-4" style="max-width: 700px;">
    <div class="text-center mb-4">
      <h1 class="h2 mb-2">{{ paymentContent.headerTitle }}</h1>
      <p v-if="user" class="text-muted mb-0">{{ paymentContent.greetingLabel }} {{ user.nombre }}</p>
    </div>

    <div v-if="isLoading" class="alert alert-info text-center">
      {{ paymentContent.loadingLabel }}
    </div>

    <div v-if="error && !isLoading" class="alert alert-danger d-flex justify-content-between align-items-center flex-wrap gap-2">
      <span>{{ error }}</span>
      <button @click="loadContribution" class="btn btn-danger btn-sm">{{ paymentContent.retryLabel }}</button>
    </div>

    <div v-if="contribution && !isLoading" class="card shadow-sm">
      <div class="card-body border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h2 class="h5 mb-0">{{ paymentContent.detailsTitle }}</h2>
        <span class="badge" :class="getStatusBadgeClass(contribution.estado_pago)">
          {{ getStatusLabel(contribution.estado_pago) }}
        </span>
      </div>

      <div class="card-body border-bottom">
        <div class="d-flex justify-content-between py-2 border-bottom">
          <span class="fw-semibold text-muted">{{ paymentContent.detailLabels.level }}</span>
          <span class="text-end">{{ contribution.nivel_nombre }}</span>
        </div>

        <div class="d-flex justify-content-between py-2 border-bottom">
          <span class="fw-semibold text-muted">{{ paymentContent.detailLabels.amount }}</span>
          <span class="text-end">$ {{ formatAmount(contribution.monto) }}</span>
        </div>

        <div class="d-flex justify-content-between py-2 border-bottom">
          <span class="fw-semibold text-muted">{{ paymentContent.detailLabels.created }}</span>
          <span class="text-end">{{ formatDate(contribution.created_at) }}</span>
        </div>

        <div v-if="contribution.completed_at" class="d-flex justify-content-between py-2 border-bottom">
          <span class="fw-semibold text-muted">{{ paymentContent.detailLabels.completed }}</span>
          <span class="text-end">{{ formatDate(contribution.completed_at) }}</span>
        </div>

        <div class="d-flex justify-content-between py-2">
          <span class="fw-semibold text-muted">{{ paymentContent.detailLabels.token }}</span>
          <span class="text-end font-monospace small bg-light px-2 py-1 rounded">{{ contribution.token }}</span>
        </div>
      </div>

      <div class="card-body border-bottom">
        <div v-if="contribution.estado_pago === 'pendiente'" class="text-center">
          <h3 class="h6 mb-2">{{ paymentContent.payment.pendingTitle }}</h3>
          <p class="text-muted mb-3">{{ paymentContent.payment.pendingSubtitle }}</p>

          <button
            @click="initiatePayment"
            class="btn btn-primary"
            :disabled="isProcessing"
          >
            {{ isProcessing ? subscribeContent.submitLoadingLabel : paymentContent.payment.pendingButton }}
          </button>
        </div>

        <div v-if="contribution.estado_pago === 'procesando'" class="text-center">
          <h3 class="h6 mb-2">{{ paymentContent.payment.processingTitle }}</h3>
          <p class="text-muted mb-3">{{ paymentContent.payment.processingSubtitle }}</p>
          <button @click="loadContribution" class="btn btn-outline-secondary">
            {{ paymentContent.payment.processingButton }}
          </button>
        </div>

        <div v-if="contribution.estado_pago === 'completado'" class="text-center">
          <div class="alert alert-success mb-0">
            <h3 class="h6 mb-2">{{ paymentContent.payment.completedTitle }}</h3>
            <p class="mb-2">{{ paymentContent.payment.completedSubtitle }}</p>
            <p class="small mb-0">
            {{ paymentContent.payment.completedNote }}
            </p>
          </div>
        </div>

        <div v-if="contribution.estado_pago === 'fallido'" class="text-center">
          <h3 class="h6 mb-2">{{ paymentContent.payment.failedTitle }}</h3>
          <p class="text-muted mb-3">{{ paymentContent.payment.failedSubtitle }}</p>
          <button
            @click="initiatePayment"
            class="btn btn-primary"
            :disabled="isProcessing"
          >
            {{ isProcessing ? subscribeContent.submitLoadingLabel : paymentContent.payment.failedButton }}
          </button>
        </div>

        <div v-if="contribution.estado_pago === 'cancelado'" class="text-center">
          <h3 class="h6 mb-2">{{ paymentContent.payment.cancelledTitle }}</h3>
          <p class="text-muted mb-3">{{ paymentContent.payment.cancelledSubtitle }}</p>
          <button
            @click="initiatePayment"
            class="btn btn-primary"
            :disabled="isProcessing"
          >
            {{ isProcessing ? subscribeContent.submitLoadingLabel : paymentContent.payment.cancelledButton }}
          </button>
        </div>
      </div>

      <div class="card-body">
        <div class="alert alert-info mb-0">
          <p class="mb-0">
            <strong>{{ paymentContent.infoHelpTitle }}</strong>
            {{ paymentContent.infoHelpSubtitle }}
          </p>
        </div>
      </div>
    </div>

    <div v-if="!isLoading && !contribution && !error" class="alert alert-secondary text-center">
      <p class="mb-2">{{ paymentContent.notFoundLabel }}</p>
      <router-link to="/subscribe" class="link text-decoration-none">
        {{ paymentContent.notFoundCta }}
      </router-link>
    </div>

    <div v-if="showAuthInfo" class="alert alert-light text-center">
      <p class="mb-0">
        {{ paymentContent.authInfoPrefix }}
        <router-link to="/account" class="text-decoration-none">{{ paymentContent.authInfoLink }}</router-link>
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
import { toAppError } from '@/application/errors/toAppError'
import type { User } from '@/domain/user'
import { content } from '@/infrastructure/content'
import { logger } from '@/infrastructure/logging/logger'

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

interface MercadoPagoClient {
  redirect: (preferenceId: string) => void
}

const getMercadoPagoClient = (): MercadoPagoClient | null => {
  const maybeMp = (window as { MercadoPago?: MercadoPagoClient }).MercadoPago
  return maybeMp && typeof maybeMp.redirect === 'function' ? maybeMp : null
}

const route = useRoute()
const subscriptionService = useSubscription()
const paymentContent = content.subscribePaymentView
const subscribeContent = content.subscribeView

const user = ref<User | null>(null)
const contribution = ref<Contribution | null>(null)
const isLoading = ref(false)
const isProcessing = ref(false)
const error = ref<string | null>(null)

const token = computed(() => route.params.token as string)
const showAuthInfo = computed(() => !user.value && contribution.value)

const loadContribution = async () => {
  if (!token.value?.trim()) {
    error.value = paymentContent.errors.emptyToken
    logger.event('warn', {
      code: 'SUBSCRIBE_PAYMENT_EMPTY_TOKEN',
      context: paymentContent.errors.emptyToken
    })
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
      logger.event('warn', {
        code: 'SUBSCRIBE_PAYMENT_NOT_FOUND',
        context: 'No se pudo cargar la contribucion por token',
        safeDetails: { hasServiceError: Boolean(subscriptionService.error.value) }
      })
    }
  } catch (err) {
    const appError = toAppError(err, paymentContent.errors.loadContribution)
    error.value = paymentContent.errors.loadContribution
    logger.event('error', {
      code: 'SUBSCRIBE_PAYMENT_LOAD_EXCEPTION',
      context: appError.message,
      safeDetails: { type: appError.type, statusCode: appError.statusCode }
    })
  } finally {
    isLoading.value = false
  }
}

const initiatePayment = async () => {
  if (!contribution.value?.mercadopago_preference_id) {
    error.value = paymentContent.errors.paymentInfo
    return
  }

  isProcessing.value = true

  try {
    const mp = getMercadoPagoClient()
    if (mp) {
      mp.redirect(contribution.value.mercadopago_preference_id)
    } else {
      window.location.href = `https://www.mercadopago.com/checkout/v1/redirect?preference-id=${contribution.value.mercadopago_preference_id}`
    }
  } catch (err) {
    const appError = toAppError(err, paymentContent.errors.paymentInit)
    error.value = paymentContent.errors.paymentInit
    logger.event('error', {
      code: 'SUBSCRIBE_PAYMENT_INIT_FAILED',
      context: appError.message,
      safeDetails: { type: appError.type, statusCode: appError.statusCode }
    })
  } finally {
    isProcessing.value = false
  }
}

const getStatusLabel = (status: string): string => {
  return paymentContent.statusLabels[status] || status
}

const formatAmount = (amount: number): string => {
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

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

onMounted(() => {
  const auth = useAuthService()
  user.value = auth.getCurrentUser()
  loadContribution()
})
</script>
