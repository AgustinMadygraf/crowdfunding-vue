<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useContributionLevels } from '@/application/useContributionLevels'
import { getUTMFromSessionStorage, type UTMParams } from '@/utils/utm'
import { initMercadoPago } from '@/infrastructure/mercadopagoService'
import { authService } from '@/infrastructure/services/authServiceFactory'
import { contributionsRepository, ContributionRepositoryError } from '@/infrastructure/repositories/ContributionsRepository'
import GoogleAuthButton from '@/components/auth/GoogleAuthButton.vue'
import type { User } from '@/domain/user'

const router = useRouter()
const { levels, selectedLevel, selectLevel, benefitAmount } = useContributionLevels()
// Chatwoot form and contact syncing removed; relying on Google Auth only

// Auth state
const user = ref<User | null>(null)
const isAuthenticationModalOpen = ref(false)

// Form data removed; user info comes from Google Auth

// Form validation removed

const isSubmitting = ref(false)
const submitError = ref<string | null>(null)
const utmParams = ref<UTMParams | null>(null)
const contributionCreated = ref(false)
const contributionToken = ref<string | null>(null)
const isProcessingPayment = ref(false)

const isAuthenticated = computed(() => authService.isAuthenticated())

// Cargar usuario actual y UTM params al montar
onMounted(async () => {
  console.log('[Subscribe] 📋 Montando SubscribeView...')
  
  try {
    user.value = authService.getCurrentUser()
    if (user.value) {
      console.log('[Subscribe] 👤 Usuario actual:', user.value.email)
    } else {
      console.log('[Subscribe] ⚠️ Sin usuario autenticado')
    }
  } catch (userError) {
    console.error('[Subscribe] ❌ Error al obtener usuario:', userError)
  }

  try {
    utmParams.value = getUTMFromSessionStorage()
    if (utmParams.value) {
      console.log('[Subscribe] 📊 UTM params cargados:', utmParams.value)
    }
  } catch (utmError) {
    console.warn('[Subscribe] ⚠️ Error al cargar UTM params:', utmError)
  }
  
  // Inicializar MercadoPago SDK
  console.log('[Subscribe] 💳 Inicializando MercadoPago...')
  try {
    await initMercadoPago()
    console.log('[Subscribe] ✅ MercadoPago inicializado')
  } catch (error) {
    console.error('[Subscribe] ❌ Error en inicialización de MercadoPago:', error)
    console.error('[Subscribe] Tipo:', typeof error)
    console.error('[Subscribe] Detalles:', error instanceof Error ? error.message : 'Error desconocido')
    console.warn('[Subscribe] ⚠️ Los pagos pueden no funcionar correctamente')
    submitError.value = 'Error al cargar Mercado Pago. Por favor, recarga la página.'
  }
})

// Form field handlers removed

/**
 * Maneja el éxito de autenticación con Google
 */
const handleAuthSuccess = (authenticatedUser: User) => {
  user.value = authenticatedUser
  isAuthenticationModalOpen.value = false
  
  // Forzar actualización de la UI redirigiendo brevemente
  console.log('[Subscribe] ✅ Auth exitoso, actualizando UI...')
  setTimeout(() => {
    window.location.reload()
  }, 300)
}

/**
 * Maneja el submit del formulario
 */
const handleSubmit = async () => {
  console.log('[Subscribe] 🔄 handleSubmit iniciado')
  
  if (!selectedLevel.value) {
    submitError.value = 'Seleccioná un nivel de contribución para continuar'
    console.warn('[Subscribe] ⚠️ Envío bloqueado: sin nivel seleccionado')
    return
  }

  // Si no está autenticado, abrir modal de Google Auth
  if (!isAuthenticated.value) {
    console.log('[Subscribe] ℹ️ Usuario no autenticado, abriendo modal de auth')
    isAuthenticationModalOpen.value = true
    return
  }

  if (!user.value) {
    submitError.value = 'Error: usuario no disponible'
    return
  }

  console.log('[Subscribe] 📝 Creando contribución...')
  console.log('[Subscribe] 👤 Email:', user.value.email)
  console.log('[Subscribe] 💰 Nivel:', selectedLevel.value.name, `($${selectedLevel.value.amount})`)

  submitError.value = null
  isSubmitting.value = true

  try {
    // Crear contribución usando repository
    console.log('[Subscribe] 1️⃣ Creando contribución en backend...')
    
    const contribution = await contributionsRepository.create({
      user_id: user.value.id,
      monto: selectedLevel.value.amount,
      nivel_id: selectedLevel.value.name,
      nivel_nombre: selectedLevel.value.name,
      utm_params: utmParams.value || {}
    })
    
    console.log('[Subscribe] ✅ Contribución creada')
    console.log('[Subscribe] 🎫 Token:', contribution.token.substring(0, 20) + '...')

    contributionToken.value = contribution.token
    contributionCreated.value = true
    
    console.log('[Subscribe] 2️⃣ Preparado para pago')

  } catch (error) {
    console.error('[Subscribe] ❌ Error en handleSubmit:', error)
    
    if (error instanceof ContributionRepositoryError) {
      console.error('[Subscribe] Status:', error.statusCode)
      console.error('[Subscribe] Detalles:', error.details)
      
      // Mensajes de error más amigables según código HTTP
      if (error.statusCode === 401) {
        submitError.value = 'Sesión expirada. Por favor, cerrá sesión y volvé a ingresar.'
      } else if (error.statusCode === 403) {
        submitError.value = 'No tenés permisos para realizar esta acción.'
      } else if (error.statusCode && error.statusCode >= 500) {
        submitError.value = 'Error del servidor. Por favor, intentá de nuevo más tarde.'
      } else {
        submitError.value = error.message || 'Error al crear contribución'
      }
    } else {
      submitError.value = error instanceof Error ? error.message : 'Error desconocido al procesar tu contribución'
    }
    console.error('[Subscribe] Stack:', error instanceof Error ? error.stack : 'No disponible')
    submitError.value = error instanceof Error ? error.message : 'Error al procesar solicitud'
  } finally {
    isSubmitting.value = false
  }
}

const handlePayment = async () => {
  console.log('[Subscribe] 🛒 handlePayment iniciado')
  
  if (!contributionToken.value) {
    const errorMsg = 'Token de contribución no disponible'
    console.error('[Subscribe] ❌ ' + errorMsg)
    submitError.value = `Error: ${errorMsg}`
    return
  }

  if (!selectedLevel.value) {
    const errorMsg = 'Nivel no disponible'
    console.error('[Subscribe] ❌ ' + errorMsg)
    submitError.value = `Error: ${errorMsg}`
    return
  }

  console.log('[Subscribe] 💳 Iniciando proceso de pago...')
  console.log('[Subscribe] 🎫 Token:', contributionToken.value.substring(0, 20) + '...')
  console.log('[Subscribe] 💰 Nivel:', selectedLevel.value.name)

  isProcessingPayment.value = true
  submitError.value = null

  try {
    console.log('[Subscribe] 📍 Redirigiendo a página de pago...')
    // Redirigir a la página de pago
    const paymentUrl = `/subscribe/${contributionToken.value}`
    console.log('[Subscribe] 🔗 URL:', paymentUrl)
    router.push(paymentUrl)
    console.log('[Subscribe] ✅ Redirección iniciada')
  } catch (error) {
    console.error('[Subscribe] ❌ Error al redirigir:', error)
    console.error('[Subscribe] Tipo:', typeof error)
    console.error('[Subscribe] Detalles:', error instanceof Error ? error.message : 'Error desconocido')
    submitError.value = 'No se pudo iniciar el proceso de pago'
    isProcessingPayment.value = false
  }
}
</script>

<template>
  <div class="subscribe-view">
    <section class="hero-section">
      <div class="container-narrow">
        <h1>Iniciar Contribución</h1>
        <p class="subtitle">Apoya nuestro proyecto colaborando con nosotros</p>
      </div>
    </section>

    <!-- Authentication Modal -->
    <div v-if="isAuthenticationModalOpen && !isAuthenticated" class="modal-overlay" @click="isAuthenticationModalOpen = false">
      <div class="modal-content" @click.stop>
        <button class="close-button" @click="isAuthenticationModalOpen = false">×</button>
        <h2>Ingresá a tu cuenta</h2>
        <p>Para continuar necesitás autenticarte con Google</p>
        <GoogleAuthButton 
          @auth-success="handleAuthSuccess"
          @logout="isAuthenticationModalOpen = false"
        />
      </div>
    </div>

    <section class="form-section">
      <div class="container-narrow">
        <div v-if="isAuthenticated && user" class="auth-header">
          <div class="user-badge">
            <img v-if="user.avatar_url" :src="user.avatar_url" :alt="user.nombre" class="avatar-sm">
            <div>
              <p class="greeting">Hola, {{ user.nombre }}</p>
              <p class="email">{{ user.email }}</p>
            </div>
          </div>
          <router-link to="/account" class="dashboard-link">
            Mi Dashboard
          </router-link>
        </div>

        <div class="form-container">
          <div v-if="selectedLevel && !contributionCreated" class="level-summary">
            <h2>Nivel seleccionado</h2>
            <div class="level-info">
              <h3>{{ selectedLevel.name }}</h3>
              <p class="amount">${{ selectedLevel.amount.toLocaleString() }}</p>
              <p class="benefit">Beneficio: {{ benefitAmount }}</p>
            </div>
            <button @click="selectLevel(levels[0])" class="change-level-btn">
              Cambiar nivel
            </button>
          </div>

          <div v-if="!selectedLevel && !contributionCreated" class="level-selector">
            <h2>Seleccioná tu nivel de aporte</h2>
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
            <h2>Autenticación y confirmación</h2>

            <div v-if="!isAuthenticated" class="auth-prompt">
              <p>Necesitás autenticarte para continuar</p>
              <button type="button" class="auth-button" @click="isAuthenticationModalOpen = true">
                Continuar con Google
              </button>
            </div>

            <div v-else>
              <div v-if="submitError" class="form-error-banner">{{ submitError }}</div>
              <button type="button" class="submit-button" :disabled="isSubmitting" @click="handleSubmit">
                {{ isSubmitting ? 'Procesando...' : 'Continuar al pago' }}
              </button>
            </div>
          </div>

          <div v-if="contributionCreated && contributionToken" class="success-section">
            <div class="success-message">
              <h3>✅ Contribución registrada</h3>
              <p>¡Excelente! Tu contribución ha sido registrada. Ahora procede con el pago.</p>
            </div>

            <div class="payment-summary">
              <h4>Resumen de tu contribución</h4>
              <div class="summary-row">
                <span>Nombre:</span>
                <strong>{{ user?.nombre }}</strong>
              </div>
              <div class="summary-row">
                <span>Email:</span>
                <strong>{{ user?.email }}</strong>
              </div>
              <div class="summary-row">
                <span>Nivel:</span>
                <strong>{{ selectedLevel?.name }}</strong>
              </div>
              <div class="summary-row highlight">
                <span>Monto:</span>
                <strong>${{ selectedLevel?.amount.toLocaleString() }}</strong>
              </div>
            </div>

            <button type="button" class="payment-button" @click="handlePayment" :disabled="isProcessingPayment">
              <span v-if="!isProcessingPayment">💳 Ir a Pagar</span>
              <span v-else>Redirigiendo...</span>
            </button>

            <p class="payment-note">
              Serás redirigido a tu página de pago personalizada donde podrás completar la transacción.
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

.container-narrow {
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

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #666;
}

.close-button:hover {
  color: #000;
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

.dashboard-link {
  padding: 0.5rem 1rem;
  background: var(--color-primary);
  color: white;
  border-radius: 0.25rem;
  text-decoration: none;
  font-size: 0.875rem;
  transition: background 0.2s;
}

.dashboard-link:hover {
  opacity: 0.9;
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

.change-level-btn {
  padding: 0.5rem 1rem;
  background: #ddd;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.2s;
}

.change-level-btn:hover {
  background: #ccc;
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

.auth-button {
  padding: 0.75rem 1.5rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.auth-button:hover {
  opacity: 0.9;
}

.submit-button {
  width: 100%;
  padding: 1rem;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.submit-button:hover:not(:disabled) {
  background: #359268;
}

.submit-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Testing Mode Styles */
.testing-mode-section {
  margin-bottom: 2rem;
}

.testing-mode-banner {
  background: linear-gradient(135deg, #f9a825 0%, #ff8c00 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #ff6b00;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.testing-mode-banner p {
  margin: 0;
  font-weight: 500;
}

.testing-mode-button {
  padding: 0.75rem 1.5rem;
  background: white;
  color: #ff8c00;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.testing-mode-button:hover {
  background: #fff;
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.testing-mode-active {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-grow: 1;
}

.testing-mode-active .badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

.testing-mode-active p {
  margin: 0;
  font-size: 0.95rem;
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

.payment-button {
  width: 100%;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #009ee3 0%, #0077cc 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 136, 204, 0.2);
}

.payment-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #0088cc 0%, #0066bb 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 136, 204, 0.3);
}

.payment-button:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
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
