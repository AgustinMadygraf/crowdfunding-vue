<!--
Path: src/views/SubscribeView.vue
-->

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useContributionLevels } from '@/application/useContributionLevels'
import { getUTMFromSessionStorage, type UTMParams } from '@/utils/utm'
import { initMercadoPago } from '@/infrastructure/mercadopagoService'
import { useSubscription } from '@/application/useSubscription'
import { ContributionRepositoryError } from '@/application/ports/ContributionsRepository'
import { validateContribution } from '@/application/schemas/contributionSchema'
import GoogleAuthButton from '@/components/auth/GoogleAuthButton.vue'
import type { User } from '@/domain/user'
import { sanitizeAvatarUrl } from '@/utils/urlSanitizer'
import { useAuthStore } from '@/stores/authStore'
import { content } from '@/infrastructure/content'


const router = useRouter()
const { levels, selectedLevel, selectLevel, benefitAmount } = useContributionLevels()
// Chatwoot form and contact syncing removed; relying on Google Auth only

// Auth state
const isAuthenticationModalOpen = ref(false)

// Form data removed; user info comes from Google Auth

// Form validation removed

const isSubmitting = ref(false)
const submitError = ref<string | null>(null)
const utmParams = ref<UTMParams | null>(null)
const contributionCreated = ref(false)
const contributionToken = ref<string | null>(null)
const isProcessingPayment = ref(false)

const authStore = useAuthStore()
const user = computed(() => authStore.user)
const isAuthenticated = computed(() => authStore.isAuthenticated)
const { createContribution } = useSubscription()
const subscribeContent = content.subscribeView

// Cargar usuario actual y UTM params al montar
onMounted(async () => {
  if (import.meta.env.DEV) {
  }
  authStore.hydrateFromService()
  
  try {
    if (user.value) {
      if (import.meta.env.DEV) {
      }
    } else {
      if (import.meta.env.DEV) {
      }
    }
  } catch (userError) {
    console.error('[Subscribe] ❌ Error al obtener usuario:', userError)
  }

  try {
    utmParams.value = getUTMFromSessionStorage()
    if (utmParams.value) {
      if (import.meta.env.DEV) {
      }
    }
  } catch (utmError) {
    console.warn('[Subscribe] ⚠️ Error al cargar UTM params:', utmError)
  }
  
  // Inicializar MercadoPago SDK
  if (import.meta.env.DEV) {
  }
  try {
    await initMercadoPago()
    if (import.meta.env.DEV) {
    }
  } catch (error) {
    console.error('[Subscribe] ❌ Error en inicialización de MercadoPago:', error)
    if (import.meta.env.DEV) {
      console.error('[Subscribe] Tipo:', typeof error)
      console.error('[Subscribe] Detalles:', error instanceof Error ? error.message : 'Error desconocido')
    }
    console.warn('[Subscribe] ⚠️ Los pagos pueden no funcionar correctamente')
    submitError.value = subscribeContent.errors.loadPayment
  }
})

// Form field handlers removed

/**
 * Maneja el éxito de autenticación con Google
 */
const handleAuthSuccess = (authenticatedUser: User) => {
  isAuthenticationModalOpen.value = false
}

/**
 * Maneja el submit del formulario
 */
const handleSubmit = async () => {
  
  if (!selectedLevel.value) {
    submitError.value = subscribeContent.errors.missingLevel
    console.warn('[Subscribe] ⚠️ Envío bloqueado: sin nivel seleccionado')
    return
  }

  // Si no está autenticado, abrir modal de Google Auth
  if (!isAuthenticated.value) {
    isAuthenticationModalOpen.value = true
    return
  }

  if (!user.value) {
    submitError.value = subscribeContent.errors.missingUser
    return
  }

  submitError.value = null
  isSubmitting.value = true

  try {
    // Validar datos antes de enviar (Zod)
    const validationResult = validateContribution({
      user_id: user.value.id,
      monto: selectedLevel.value.amount,
      nivel_id: selectedLevel.value.name,
      nivel_nombre: selectedLevel.value.name,
      utm_params: utmParams.value || {}
    })

    if (!validationResult.valid) {
      const errorMessages = Object.values(validationResult.errors).join(', ')
      submitError.value = `${subscribeContent.errors.validationFailed} ${errorMessages}`
      console.error('[Subscribe] ❌ Errores de validación:', validationResult.errors)
      isSubmitting.value = false
      return
    }

    // Crear contribución usando repository
    const token = await createContribution({
      user_id: user.value.id,
      monto: selectedLevel.value.amount,
      nivel_id: selectedLevel.value.name,
      nivel_nombre: selectedLevel.value.name,
      utm_params: utmParams.value || {}
    })

    contributionToken.value = token
    contributionCreated.value = true

  } catch (error) {
    console.error('Error en submit de contribución', error)
    // Mostrar errores claros al usuario
    if (error instanceof ContributionRepositoryError) {
      if (error.statusCode === 401) {
        submitError.value = subscribeContent.errors.expiredSession
      } else if (error.statusCode === 403) {
        submitError.value = subscribeContent.errors.forbidden
      } else if (error.statusCode && error.statusCode >= 500) {
        submitError.value = subscribeContent.errors.serverError
      } else {
        submitError.value = error.message || subscribeContent.errors.createContribution
      }
    } else if (error instanceof Error) {
      submitError.value = error.message
    } else {
      submitError.value = subscribeContent.errors.unknownContribution
    }
    console.error('[Subscribe] ❌ Error en handleSubmit:', error)
    isSubmitting.value = false
  } finally {
    isSubmitting.value = false
  }
}

const handlePayment = async () => {
  
  if (!contributionToken.value) {
    const errorMsg = subscribeContent.errors.missingToken
    console.error('[Subscribe] ❌ ' + errorMsg)
    submitError.value = `Error: ${errorMsg}`
    return
  }

  if (!selectedLevel.value) {
    const errorMsg = subscribeContent.errors.missingLevelPayment
    console.error('[Subscribe] ❌ ' + errorMsg)
    submitError.value = `Error: ${errorMsg}`
    return
  }

  isProcessingPayment.value = true
  submitError.value = null

  try {
    // Redirigir a la página de pago
    const paymentUrl = `/subscribe/${contributionToken.value}`
    router.push(paymentUrl)
  } catch (error) {
    console.error('[Subscribe] ❌ Error al redirigir:', error)
    console.error('[Subscribe] Tipo:', typeof error)
    console.error('[Subscribe] Detalles:', error instanceof Error ? error.message : 'Error desconocido')
    submitError.value = subscribeContent.errors.paymentInit
    isProcessingPayment.value = false
  }
}
</script>

<template>
  <div class="d-flex flex-column">
    <section class="py-5 text-center text-white" style="background: linear-gradient(135deg, #42b983 0%, #2c3e50 100%);">
      <div class="container">
        <h1 class="display-5 fw-bold mb-3">{{ subscribeContent.heroTitle }}</h1>
        <p class="lead mb-0">{{ subscribeContent.heroSubtitle }}</p>
      </div>
    </section>

    <!-- Authentication Modal -->
    <div v-if="isAuthenticationModalOpen && !isAuthenticated">
      <div class="modal fade show d-block" tabindex="-1" role="dialog" @click="isAuthenticationModalOpen = false">
        <div class="modal-dialog modal-dialog-centered" @click.stop>
          <div class="modal-content">
            <div class="modal-header">
              <h2 class="modal-title h5">{{ subscribeContent.authModalTitle }}</h2>
              <button
                type="button"
                class="btn-close"
                :aria-label="subscribeContent.authModalClose"
                @click="isAuthenticationModalOpen = false"
              ></button>
            </div>
            <div class="modal-body">
              <p class="mb-4">{{ subscribeContent.authModalSubtitle }}</p>
              <GoogleAuthButton 
                @auth-success="handleAuthSuccess"
                @logout="isAuthenticationModalOpen = false"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade show"></div>
    </div>

    <section class="py-4 bg-light">
      <div class="container" style="max-width: 700px;">
        <div v-if="isAuthenticated && user" class="card shadow-sm mb-4">
          <div class="card-body d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div class="user-badge">
            <img v-if="user.avatar_url" :src="sanitizeAvatarUrl(user.avatar_url)" :alt="user.nombre" class="rounded-circle" width="40" height="40">
            <div>
              <p class="fw-semibold mb-0">{{ subscribeContent.greetingLabel }} {{ user.nombre }}</p>
              <p class="text-muted small mb-0">{{ user.email }}</p>
            </div>
          </div>
          <router-link to="/account" class="btn btn-primary btn-sm">
            {{ subscribeContent.dashboardLink }}
          </router-link>
          </div>
        </div>

        <div class="card shadow-sm">
          <div class="card-body p-4">
          <div v-if="selectedLevel && !contributionCreated" class="level-summary">
            <h2 class="h4 mb-3">{{ subscribeContent.levelSelectedTitle }}</h2>
            <div class="bg-light border rounded-2 p-3 mb-3">
              <h3 class="h5 mb-2">{{ selectedLevel.name }}</h3>
              <p class="fs-4 fw-bold mb-1">${{ selectedLevel.amount.toLocaleString() }}</p>
              <p class="text-muted mb-0">{{ subscribeContent.levelBenefitLabel }} {{ benefitAmount }}</p>
            </div>
            <button @click="selectLevel(levels[0])" class="btn btn-outline-secondary btn-sm">
              {{ subscribeContent.changeLevelLabel }}
            </button>
          </div>

          <div v-if="!selectedLevel && !contributionCreated" class="level-selector">
            <h2 class="h4 mb-3">{{ subscribeContent.levelSelectorTitle }}</h2>
            <div class="row g-3">
              <button
                v-for="level in levels"
                :key="level.name"
                class="btn btn-outline-secondary text-start"
                @click="selectLevel(level)"
              >
                <span class="fw-semibold d-block">{{ level.name }}</span>
                <span class="amount d-block">${{ level.amount.toLocaleString() }}</span>
              </button>
            </div>
          </div>

          <div v-if="selectedLevel && !contributionCreated" class="contribution-form">
            <h2 class="h4 mb-3">{{ subscribeContent.authConfirmTitle }}</h2>

            <div v-if="!isAuthenticated" class="alert alert-info text-center">
              <p class="mb-3">{{ subscribeContent.authPrompt }}</p>
              <button type="button" class="btn btn-primary" @click="isAuthenticationModalOpen = true">
                {{ subscribeContent.authPromptButton }}
              </button>
            </div>

            <div v-else>
              <div v-if="submitError" class="alert alert-danger text-center">{{ submitError }}</div>
              <button type="button" class="btn btn-success w-100" :disabled="isSubmitting" @click="handleSubmit">
                {{ isSubmitting ? subscribeContent.submitLoadingLabel : subscribeContent.submitLabel }}
              </button>
            </div>
          </div>

          <div v-if="contributionCreated && contributionToken" class="mt-4">
            <div class="alert alert-success text-center">
              <h3 class="h5 mb-2">{{ subscribeContent.successTitle }}</h3>
              <p class="mb-0">{{ subscribeContent.successSubtitle }}</p>
            </div>

            <div class="card border-0 bg-light mb-3">
              <div class="card-body">
                <h4 class="h6 text-uppercase text-muted">{{ subscribeContent.summaryTitle }}</h4>
                <div class="d-flex justify-content-between py-2 border-bottom">
                  <span>{{ subscribeContent.summaryNameLabel }}</span>
                  <strong>{{ user?.nombre }}</strong>
                </div>
                <div class="d-flex justify-content-between py-2 border-bottom">
                  <span>{{ subscribeContent.summaryEmailLabel }}</span>
                  <strong>{{ user?.email }}</strong>
                </div>
                <div class="d-flex justify-content-between py-2 border-bottom">
                  <span>{{ subscribeContent.summaryLevelLabel }}</span>
                  <strong>{{ selectedLevel?.name }}</strong>
                </div>
                <div class="d-flex justify-content-between py-2 fw-semibold">
                  <span>{{ subscribeContent.summaryAmountLabel }}</span>
                  <strong>${{ selectedLevel?.amount.toLocaleString() }}</strong>
                </div>
              </div>
            </div>

            <button type="button" class="btn btn-primary btn-lg w-100" @click="handlePayment" :disabled="isProcessingPayment">
              <span v-if="!isProcessingPayment">{{ subscribeContent.payLabel }}</span>
              <span v-else>{{ subscribeContent.payLoadingLabel }}</span>
            </button>

            <p class="text-muted text-center small fst-italic mt-3 mb-0">
              {{ subscribeContent.payNote }}
            </p>
          </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
