<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useContributionLevels } from '@/application/useContributionLevels'
import { getUTMFromSessionStorage, type UTMParams } from '@/utils/utm'
import { useFormValidation } from '@/application/composables/useFormValidation'
import { useChatwoot } from '@/application/composables/useChatwoot'
import { subscriptionFormSchema, type SubscriptionFormData } from '@/application/schemas/subscriptionSchema'
import { chatwootClientService } from '@/infrastructure/services/chatwootClientService'
import { initMercadoPago } from '@/infrastructure/mercadopagoService'
import { authService } from '@/infrastructure/services/authService'
import GoogleAuthButton from '@/components/auth/GoogleAuthButton.vue'
import type { User } from '@/domain/user'

const router = useRouter()
const { levels, selectedLevel, selectLevel, benefitAmount } = useContributionLevels()
const { setUser, setCustomAttributes } = useChatwoot()

// Auth state
const user = ref<User | null>(null)
const isAuthenticationModalOpen = ref(false)

// Form state
const formData = ref({
  nombre: '',
  email: '',
  telefono: '',
  whatsapp: '',
  provincia: '',
  tipo_interesado: '',
  rango_monto: '',
  consentimiento: false
})

// Validación con Zod
const { 
  errors,
  formError,
  isValid,
  validateField,
  validateForm,
  clearFieldError
} = useFormValidation(subscriptionFormSchema)

const isSubmitting = ref(false)
const submitError = ref<string | null>(null)
const utmParams = ref<UTMParams | null>(null)
const contributionCreated = ref(false)
const contributionToken = ref<string | null>(null)
const isProcessingPayment = ref(false)

const isAuthenticated = computed(() => authService.isAuthenticated())

// Cargar usuario actual y UTM params al montar
onMounted(async () => {
  user.value = authService.getCurrentUser()
  utmParams.value = getUTMFromSessionStorage()
  if (utmParams.value) {
    console.log('[Subscribe] UTM params loaded:', utmParams.value)
  }
  
  // Inicializar MercadoPago SDK
  try {
    await initMercadoPago()
    console.log('[Subscribe] MercadoPago initialized')
  } catch (error) {
    console.warn('[Subscribe] MercadoPago initialization failed:', error)
  }
})

// Validar campo individual al perder foco
const handleBlur = (fieldName: keyof SubscriptionFormData) => {
  validateField(fieldName, formData.value[fieldName])
}

// Limpiar error al empezar a escribir
const handleInput = (fieldName: keyof SubscriptionFormData) => {
  clearFieldError(fieldName)
}

/**
 * Maneja el éxito de autenticación con Google
 */
const handleAuthSuccess = (authenticatedUser: User) => {
  user.value = authenticatedUser
  formData.value.nombre = authenticatedUser.nombre
  formData.value.email = authenticatedUser.email
  isAuthenticationModalOpen.value = false
}

/**
 * Crea una contribución en el backend
 */
const createContribution = async (): Promise<{ token: string; preference_id: string }> => {
  if (!user.value || !selectedLevel.value) {
    throw new Error('Usuario o nivel no disponible')
  }

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
  const headers = authService.getAuthHeaders()

  const response = await fetch(`${apiBaseUrl}/api/contributions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      user_id: user.value.id,
      monto: selectedLevel.value.amount,
      nivel_id: selectedLevel.value.name,
      nivel_nombre: selectedLevel.value.name,
      provincia: formData.value.provincia,
      tipo_interesado: formData.value.tipo_interesado,
      rango_monto: formData.value.rango_monto,
      utm_params: utmParams.value || {}
    })
  })

  if (!response.ok) {
    throw new Error('No se pudo crear la contribución')
  }

  return await response.json()
}

const handleSubmit = async () => {
  // Validar formulario completo
  if (!validateForm(formData.value)) {
    return
  }

  if (!selectedLevel.value) {
    submitError.value = 'Seleccioná un nivel de contribución para continuar'
    console.warn('[Subscribe] Submission blocked: no contribution level selected')
    return
  }

  // Si no está autenticado, abrir modal de Google Auth
  if (!isAuthenticated.value) {
    isAuthenticationModalOpen.value = true
    return
  }

  console.info('[Subscribe] Creating contribution...', {
    email: user.value?.email,
    level: selectedLevel.value.name
  })

  submitError.value = null
  isSubmitting.value = true

  try {
    // Crear contacto en Chatwoot (mantener compatibilidad)
    const response = await chatwootClientService.createContact(
      {
        name: user.value!.nombre,
        email: user.value!.email,
        phone: formData.value.telefono || undefined,
        whatsapp: formData.value.whatsapp || undefined,
        province: formData.value.provincia || undefined,
        type: formData.value.tipo_interesado || undefined,
        amount_range: formData.value.rango_monto || undefined
      },
      selectedLevel.value.name || '',
      utmParams.value || {},
      {
        version: '1.0',
        accepted_at: new Date().toISOString()
      }
    )

    console.info('[Subscribe] Contact created in Chatwoot:', response.contact.source_id)

    // Sincronizar con widget de Chatwoot
    await setUser(response.contact.source_id, {
      name: user.value!.nombre,
      email: user.value!.email
    })

    const chatwootAttributes = {
      source_id: response.contact.source_id,
      form_source: 'web_widget',
      level_id: selectedLevel.value.name || '',
      amount_range: formData.value.rango_monto || '',
      type: formData.value.tipo_interesado || '',
      province: formData.value.provincia || '',
      utm_source: utmParams.value?.utm_source || '',
      utm_medium: utmParams.value?.utm_medium || '',
      utm_campaign: utmParams.value?.utm_campaign || '',
      utm_term: utmParams.value?.utm_term || '',
      utm_content: utmParams.value?.utm_content || '',
      campaign_id: utmParams.value?.campaign_id || '',
      referrer: utmParams.value?.referrer || '',
      consent_version: '1.0',
      consent_accepted_at: new Date().toISOString()
    }

    await setCustomAttributes(chatwootAttributes)
    console.info('[Subscribe] Chatwoot synchronized')

    // Crear contribución en el backend
    const contribution = await createContribution()
    console.info('[Subscribe] Contribution created:', contribution.token)

    contributionToken.value = contribution.token
    contributionCreated.value = true

  } catch (error) {
    console.error('[Subscribe] Error:', error)
    submitError.value = error instanceof Error ? error.message : 'Error al procesar solicitud'
  } finally {
    isSubmitting.value = false
  }
}

const handlePayment = async () => {
  if (!contributionToken.value || !selectedLevel.value) {
    submitError.value = 'Error: Token de contribución no disponible'
    return
  }

  console.info('[Subscribe] Initiating payment...', {
    token: contributionToken.value,
    level: selectedLevel.value.name
  })

  isProcessingPayment.value = true
  submitError.value = null

  try {
    // Redirigir a la página de pago
    router.push(`/subscribe/${contributionToken.value}`)
  } catch (error) {
    console.error('[Subscribe] Error:', error)
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

          <form v-if="selectedLevel && !contributionCreated" @submit.prevent="handleSubmit" class="contribution-form">
            <h2>Completá tus datos</h2>

            <div class="form-group">
              <label for="nombre">Nombre completo *</label>
              <input
                id="nombre"
                v-model="formData.nombre"
                type="text"
                :class="{ error: errors.nombre }"
                @blur="handleBlur('nombre')"
                @input="handleInput('nombre')"
                :disabled="isAuthenticated"
                required
              />
              <span v-if="errors.nombre" class="error-message">{{ errors.nombre }}</span>
            </div>

            <div class="form-group">
              <label for="email">Email *</label>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                :class="{ error: errors.email }"
                @blur="handleBlur('email')"
                @input="handleInput('email')"
                :disabled="isAuthenticated"
                required
              />
              <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
            </div>

            <div class="form-group">
              <label for="telefono">Teléfono / WhatsApp</label>
              <input 
                id="telefono" 
                v-model="formData.telefono" 
                type="tel"
                :class="{ error: errors.telefono }"
                @blur="handleBlur('telefono')"
                @input="handleInput('telefono')"
              />
              <span v-if="errors.telefono" class="error-message">{{ errors.telefono }}</span>
            </div>

            <div class="form-group">
              <label for="provincia">Provincia</label>
              <input 
                id="provincia" 
                v-model="formData.provincia" 
                type="text"
                :class="{ error: errors.provincia }"
                @blur="handleBlur('provincia')"
                @input="handleInput('provincia')"
              />
              <span v-if="errors.provincia" class="error-message">{{ errors.provincia }}</span>
            </div>

            <div class="form-group">
              <label for="tipoInteresado">Tipo de interesado</label>
              <select 
                id="tipoInteresado" 
                v-model="formData.tipo_interesado"
                :class="{ error: errors.tipo_interesado }"
                @blur="handleBlur('tipo_interesado')"
                @change="handleInput('tipo_interesado')"
              >
                <option value="">Seleccionar...</option>
                <option value="persona">Persona</option>
                <option value="empresa">Empresa</option>
                <option value="cooperativa">Cooperativa</option>
                <option value="otro">Otro</option>
              </select>
              <span v-if="errors.tipo_interesado" class="error-message">{{ errors.tipo_interesado }}</span>
            </div>

            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input
                  v-model="formData.consentimiento"
                  type="checkbox"
                  :class="{ error: errors.consentimiento }"
                  @change="handleBlur('consentimiento')"
                  required
                />
                <span>Acepto el tratamiento de mis datos personales y las condiciones de la contribución *</span>
              </label>
              <span v-if="errors.consentimiento" class="error-message">{{ errors.consentimiento }}</span>
            </div>

            <div v-if="formError" class="form-error-banner">{{ formError }}</div>
            <div v-if="submitError" class="form-error-banner">{{ submitError }}</div>

            <div v-if="!isAuthenticated" class="auth-prompt">
              <p>Necesitás autenticarte para continuar</p>
              <button type="button" class="auth-button" @click="isAuthenticationModalOpen = true">
                Continuar con Google
              </button>
            </div>

            <button v-if="isAuthenticated" type="submit" class="submit-button" :disabled="isSubmitting">
              {{ isSubmitting ? 'Procesando...' : 'Continuar al pago' }}
            </button>

            <p class="note">* Campos obligatorios</p>
          </form>

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

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:disabled {
  background: #f0f0f0;
  cursor: not-allowed;
}

.form-group input.error,
.form-group select.error {
  border-color: #e74c3c;
}

.error-message {
  display: block;
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 0.25rem;
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

.checkbox-group {
  margin: 2rem 0;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
}

.checkbox-label input[type='checkbox'] {
  width: auto;
  margin-top: 0.25rem;
  flex-shrink: 0;
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

.note {
  margin-top: 1.5rem;
  text-align: center;
  color: #666;
  font-size: 0.875rem;
  line-height: 1.6;
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
