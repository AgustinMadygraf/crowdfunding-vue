<!--
Path: src/views/SubscriptionStatusView.vue
-->

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSubscription } from '@/presentation/composables/useSubscription'
import { content } from '@/presentation/content'


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
  <div class="d-flex flex-column min-vh-80">
    <section class="py-5 text-center text-white" style="background: linear-gradient(135deg, #42b983 0%, #2c3e50 100%);">
      <div class="container">
        <h1 class="display-6 fw-bold mb-2">{{ statusContent.heroTitle }}</h1>
        <p class="small text-white-50 mb-0 font-monospace" v-if="contributionId">{{ statusContent.idLabel }} {{ contributionId }}</p>
      </div>
    </section>

    <!-- Loading State -->
    <section v-if="isLoading" class="py-5 bg-light">
      <div class="container">
        <div class="card shadow-sm text-center p-4">
          <p class="mb-0">{{ statusContent.loadingLabel }}</p>
        </div>
      </div>
    </section>

    <!-- Error State -->
    <section v-else-if="error && !contribution" class="py-5 bg-light">
      <div class="container">
        <div class="card shadow-sm border-danger border-2 p-4 text-center">
          <h2 class="h5 text-danger mb-2">{{ statusContent.errorTitle }}</h2>
          <p class="text-muted mb-3">{{ error }}</p>
          <div class="d-flex gap-2 justify-content-center flex-wrap">
            <button @click="retry" class="btn btn-primary">{{ statusContent.retryLabel }}</button>
            <router-link to="/" class="btn btn-secondary">{{ statusContent.backHomeLabel }}</router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Success State -->
    <section v-else-if="contribution" class="py-5 bg-light">
      <div class="container">
        <div class="card shadow-sm p-4">
          <div class="d-flex justify-content-between align-items-start gap-3 flex-wrap border-bottom pb-3 mb-4">
            <h2 class="h5 mb-0">{{ statusContent.statusTitle }}</h2>
            <span
              class="badge rounded-pill text-white"
              :style="{ backgroundColor: statusColors[contribution.estado_pago] }"
            >
              {{ statusLabels[contribution.estado_pago] }}
            </span>
          </div>

          <div class="mb-4">
            <div class="d-flex justify-content-between py-3 border-bottom">
              <span class="fw-semibold text-muted">{{ statusContent.detailLabels.level }}</span>
              <span class="text-end">{{ contribution.nivel_nombre }}</span>
            </div>
            <div class="d-flex justify-content-between py-3 border-bottom">
              <span class="fw-semibold text-muted">{{ statusContent.detailLabels.amount }}</span>
              <span class="text-end">${{ contribution.monto.toLocaleString('es-AR') }}</span>
            </div>
            <div class="d-flex justify-content-between py-3 border-bottom">
              <span class="fw-semibold text-muted">{{ statusContent.detailLabels.created }}</span>
              <span class="text-end">{{
                new Date(contribution.created_at).toLocaleDateString('es-AR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              }}</span>
            </div>
            <div v-if="contribution.completed_at" class="d-flex justify-content-between py-3 border-bottom">
              <span class="fw-semibold text-muted">{{ statusContent.detailLabels.completed }}</span>
              <span class="text-end">{{
                new Date(contribution.completed_at).toLocaleDateString('es-AR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              }}</span>
            </div>
            <div class="d-flex justify-content-between py-3">
              <span class="fw-semibold text-muted">{{ statusContent.detailLabels.token }}</span>
              <span class="text-end font-monospace small bg-light px-2 py-1 rounded">{{ contribution.token }}</span>
            </div>
          </div>

          <div class="alert alert-light mb-4">
            <h3 class="h6 mb-2">{{ statusContent.explanationTitle }}</h3>
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

          <div class="d-flex gap-2 justify-content-center flex-wrap">
            <router-link
              v-if="contribution.estado_pago === 'pendiente'"
              :to="{ name: 'subscribe-payment', params: { token: contribution.token } }"
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
