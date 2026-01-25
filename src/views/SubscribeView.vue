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
  <div class="subscribe-view">
    <section class="hero-section">
      <div class="container">
        <h1>{{ subscribeContent.heroTitle }}</h1>
        <p class="subtitle">{{ subscribeContent.heroSubtitle }}</p>
      </div>
    </section>

    <!-- Authentication Modal -->
    <div v-if="isAuthenticationModalOpen && !isAuthenticated" class="modal-overlay" @click="isAuthenticationModalOpen = false">
      <div class="modal-content" @click.stop>
        <button
          type="button"
          class="btn-close"
          :aria-label="subscribeContent.authModalClose"
          @click="isAuthenticationModalOpen = false"
        ></button>
        <h2>{{ subscribeContent.authModalTitle }}</h2>
        <p>{{ subscribeContent.authModalSubtitle }}</p>
        <GoogleAuthButton 
          @auth-success="handleAuthSuccess"
          @logout="isAuthenticationModalOpen = false"
        />
      </div>
    </div>

    <section class="form-section">
      <div class="container">
        <div v-if="isAuthenticated && user" class="auth-header">
          <div class="user-badge">
            <img v-if="user.avatar_url" :src="sanitizeAvatarUrl(user.avatar_url)" :alt="user.nombre" class="avatar-sm">
            <div>
              <p class="greeting">{{ subscribeContent.greetingLabel }} {{ user.nombre }}</p>
              <p class="email">{{ user.email }}</p>
            </div>
          </div>
          <router-link to="/account" class="btn btn-primary btn-sm">
            {{ subscribeContent.dashboardLink }}
          </router-link>
        </div>

        <div class="form-container">
          <div v-if="selectedLevel && !contributionCreated" class="level-summary">
            <h2>{{ subscribeContent.levelSelectedTitle }}</h2>
            <div class="level-info">
              <h3>{{ selectedLevel.name }}</h3>
              <p class="amount">${{ selectedLevel.amount.toLocaleString() }}</p>
              <p class="benefit">{{ subscribeContent.levelBenefitLabel }} {{ benefitAmount }}</p>
            </div>
            <button @click="selectLevel(levels[0])" class="btn btn-outline-secondary btn-sm">
              {{ subscribeContent.changeLevelLabel }}
            </button>
          </div>

          <div v-if="!selectedLevel && !contributionCreated" class="level-selector">
            <h2>{{ subscribeContent.levelSelectorTitle }}</h2>
            <div class="levels-grid">
              <button
                v-for="level in levels"
                :key="level.name"
                class="level-card"
                @click="selectLevel(level)"
              >
                <h3>{{ level.name }}</h3>
                <p class="amount">${{ level.amount.toLocaleString() }}</p>
              </button>
            </div>
          </div>

          <div v-if="selectedLevel && !contributionCreated" class="contribution-form">
            <h2>{{ subscribeContent.authConfirmTitle }}</h2>

            <div v-if="!isAuthenticated" class="auth-prompt">
              <p>{{ subscribeContent.authPrompt }}</p>
              <button type="button" class="btn btn-primary" @click="isAuthenticationModalOpen = true">
                {{ subscribeContent.authPromptButton }}
              </button>
            </div>

            <div v-else>
              <div v-if="submitError" class="form-error-banner">{{ submitError }}</div>
              <button type="button" class="btn btn-success w-100" :disabled="isSubmitting" @click="handleSubmit">
                {{ isSubmitting ? subscribeContent.submitLoadingLabel : subscribeContent.submitLabel }}
              </button>
            </div>
          </div>

          <div v-if="contributionCreated && contributionToken" class="success-section">
            <div class="success-message">
              <h3>{{ subscribeContent.successTitle }}</h3>
              <p>{{ subscribeContent.successSubtitle }}</p>
            </div>

            <div class="payment-summary">
              <h4>{{ subscribeContent.summaryTitle }}</h4>
              <div class="summary-row">
                <span>{{ subscribeContent.summaryNameLabel }}</span>
                <strong>{{ user?.nombre }}</strong>
              </div>
              <div class="summary-row">
                <span>{{ subscribeContent.summaryEmailLabel }}</span>
                <strong>{{ user?.email }}</strong>
              </div>
              <div class="summary-row">
                <span>{{ subscribeContent.summaryLevelLabel }}</span>
                <strong>{{ selectedLevel?.name }}</strong>
              </div>
              <div class="summary-row highlight">
                <span>{{ subscribeContent.summaryAmountLabel }}</span>
                <strong>${{ selectedLevel?.amount.toLocaleString() }}</strong>
              </div>
            </div>

            <button type="button" class="btn btn-primary btn-lg w-100" @click="handlePayment" :disabled="isProcessingPayment">
              <span v-if="!isProcessingPayment">{{ subscribeContent.payLabel }}</span>
              <span v-else>{{ subscribeContent.payLoadingLabel }}</span>
            </button>

            <p class="payment-note">
              {{ subscribeContent.payNote }}
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.subscribe-view {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.hero-section {
  padding: 80px 20px 40px;
  background: linear-gradient(135deg, #42b983 0%, #2c3e50 100%);
  color: white;
  text-align: center;
}

.container {
  max-width: 700px;
  margin: 0 auto;
}

.hero-section h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 0.75rem;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  position: relative;
}


.modal-content h2 {
  margin-top: 0;
  color: var(--color-text);
}

.modal-content p {
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
}

.form-section {
  background-color: #f5f5f5;
  padding: 2rem 1rem;
}

.form-container {
  background: white;
  border-radius: 8px;
  padding: 3rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.auth-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: var(--color-background-soft);
  border-radius: 0.5rem;
}

.user-badge {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.avatar-sm {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.greeting {
  margin: 0;
  font-weight: 600;
  color: var(--color-text);
}

.email {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}


.level-summary,
.level-selector {
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #e0e0e0;
}

.level-summary h2,
.level-selector h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.level-info {
  background: #f5f5f5;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.level-info h3 {
  color: #42b983;
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.amount {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
  margin: 0.5rem 0;
}

.benefit {
  color: #666;
}


.levels-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}

.level-card {
  background: #f5f5f5;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.level-card:hover {
  border-color: #42b983;
  transform: translateY(-2px);
}

.level-card h3 {
  font-size: 1rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.level-card .amount {
  font-size: 1.25rem;
}

.contribution-form h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.form-error-banner {
  background: #fee;
  border: 1px solid #e74c3c;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
  color: #c0392b;
  text-align: center;
}


.auth-prompt {
  background: #f0f8ff;
  border: 1px solid #b0d4ff;
  border-radius: 0.5rem;
  padding: 1.5rem;
  text-align: center;
  margin-bottom: 1rem;
}

.auth-prompt p {
  margin: 0 0 1rem;
  color: var(--color-text-secondary);
}


.success-section {
  margin-top: 2rem;
}

.success-message {
  background: linear-gradient(135deg, #42b983 0%, #35a372 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  text-align: center;
}

.success-message h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
}

.success-message p {
  margin: 0;
  opacity: 0.95;
}

.payment-summary {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.payment-summary h4 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-row.highlight {
  padding-top: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.summary-row span {
  color: #666;
}

.summary-row strong {
  color: #2c3e50;
}


.payment-note {
  text-align: center;
  color: #666;
  font-size: 0.9rem;
  margin-top: 1rem;
  font-style: italic;
}

@media (max-width: 768px) {
  .form-container {
    padding: 2rem 1.5rem;
  }

  .auth-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .levels-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 95%;
  }
}
</style>
