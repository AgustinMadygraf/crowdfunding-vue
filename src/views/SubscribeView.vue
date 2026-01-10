<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useContributionLevels } from '@/application/useContributionLevels'
import { getUTMFromSessionStorage, hasUTMParams, type UTMParams } from '@/utils/utm'
import { useFormValidation } from '@/application/composables/useFormValidation'
import { useChatwoot } from '@/application/composables/useChatwoot'
import { subscriptionFormSchema, type SubscriptionFormData } from '@/application/schemas/subscriptionSchema'
import { chatwootClientService } from '@/infrastructure/services/chatwootClientService'
import { initMercadoPago, initiatePayment } from '@/infrastructure/mercadopagoService'

const { levels, selectedLevel, selectLevel, benefitAmount } = useContributionLevels()
const { setUser, setCustomAttributes } = useChatwoot()

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
const contactCreated = ref(false)
const contactId = ref<string | null>(null)
const isProcessingPayment = ref(false)

// Cargar UTM params y inicializar MercadoPago al montar el componente
onMounted(async () => {
  utmParams.value = getUTMFromSessionStorage()
  if (utmParams.value) {
    console.log('[Form] UTM params loaded:', utmParams.value)
  }
  
  // Inicializar MercadoPago SDK
  try {
    await initMercadoPago()
    console.log('[Form] MercadoPago initialized')
  } catch (error) {
    console.warn('[Form] MercadoPago initialization failed:', error)
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

const handleSubmit = async () => {
  // Validar formulario completo antes de enviar
  if (!validateForm(formData.value)) {
    return
  }

  if (!selectedLevel.value) {
    submitError.value = 'Seleccioná un nivel de contribución para continuar'
    console.warn('[Form] Submission blocked: no contribution level selected')
    return
  }

  console.info('[Form] Starting submission:', {
    email: formData.value.email,
    level: selectedLevel.value.name,
    hasUtm: !!utmParams.value
  })

  submitError.value = null
  isSubmitting.value = true

  try {
    // Crear contacto en Chatwoot directamente (Cliente API)
    const response = await chatwootClientService.createContact(
      {
        name: formData.value.nombre,
        email: formData.value.email,
        phone: formData.value.telefono || undefined,
        whatsapp: formData.value.whatsapp || undefined,
        province: formData.value.provincia || undefined,
        type: formData.value.tipo_interesado || undefined,
        amount_range: formData.value.rango_monto || undefined
      },
      selectedLevel.value?.name || '',
      utmParams.value || {},
      {
        version: '1.0',
        accepted_at: new Date().toISOString()
      }
    )

    // Contacto creado en Chatwoot exitosamente
    const sourceId = response.contact.source_id
    console.info('[Form] ✅ Contact created, source_id:', sourceId)

    // Sincronizar con widget de Chatwoot (setUser + setCustomAttributes)
    console.info('[Form] Syncing with Chatwoot widget...')
    await setUser(sourceId, {
      name: formData.value.nombre,
      email: formData.value.email
    })

    const chatwootAttributes = {
      source_id: sourceId,
      form_source: 'web_widget',
      level_id: selectedLevel.value?.name || '',
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
    console.info('[Form] ✅ Widget synced successfully')

    console.info('[Form] ✅ Lead registered:', sourceId)

    // Guardar contactId para el pago
    contactId.value = sourceId
    contactCreated.value = true

    console.info('[Form] ✅ Pre-registro completado. Listo para pago.')

  } catch (error) {
    console.error('[Form] ❌ Error during submission:', error)
    
    if (error instanceof Error) {
      submitError.value = `No pudimos completar tu pre-registro. ${error.message}`
    } else {
      submitError.value = 'Error inesperado al procesar tu solicitud. Por favor, intentá nuevamente.'
    }
  } finally {
    isSubmitting.value = false
    console.info('[Form] Submission completed (success or error)')
  }
}

const handlePayment = async () => {
  if (!contactId.value || !selectedLevel.value) {
    submitError.value = 'Error: Datos de contacto no disponibles'
    return
  }

  console.info('[Payment] Initiating MercadoPago flow...', {
    contact_id: contactId.value,
    level: selectedLevel.value.name,
    amount: selectedLevel.value.amount
  })

  isProcessingPayment.value = true
  submitError.value = null

  try {
    await initiatePayment({
      contact_id: contactId.value,
      level_id: selectedLevel.value.amount, // Usar amount como ID único
      level_name: selectedLevel.value.name,
      amount: selectedLevel.value.amount,
      payer_email: formData.value.email,
      payer_name: formData.value.nombre
    })

    console.info('[Payment] ✅ MercadoPago checkout opened')
    // El usuario será redirigido a MercadoPago o verá modal
    // El webhook manejará la actualización del estado

  } catch (error) {
    console.error('[Payment] ❌ Error:', error)
    submitError.value = 'No pudimos iniciar el proceso de pago. Intentá nuevamente.'
    isProcessingPayment.value = false
  }
}
</script>

<template>
  <div class="subscribe-view">
    <section class="hero-section">
      <div class="container-narrow">
        <h1>Iniciar Suscripción</h1>
        <p class="subtitle">Completá tus datos para continuar con el proceso</p>
      </div>
    </section>

    <section class="form-section section-padding section-padding">
      <div class="container-narrow">
        <div class="form-container">
          <div class="level-summary" v-if="selectedLevel">
            <h2>Nivel seleccionado</h2>
            <div class="level-info">
              <h3>{{ selectedLevel.name }}</h3>
              <p class="amount">${{ selectedLevel.amount.toLocaleString() }}</p>
              <p class="benefit">Beneficio: {{ benefitAmount }}</p>
            </div>
          </div>

          <div class="level-selector" v-else>
            <h2>Seleccioná un nivel de aporte</h2>
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

          <form @submit.prevent="handleSubmit" class="pre-registration-form">
            <h2>Pre-registro</h2>

            <div class="form-group">
              <label for="nombre">Nombre completo *</label>
              <input
                id="nombre"
                v-model="formData.nombre"
                type="text"
                :class="{ error: errors.nombre }"
                @blur="handleBlur('nombre')"
                @input="handleInput('nombre')"
                required
              />
              <span v-if="errors.nombre" class="error-message">{{
                errors.nombre
              }}</span>
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
                <span>
                  Acepto el tratamiento de mis datos personales y las condiciones de la
                  suscripción *
                </span>
              </label>
              <span v-if="errors.consentimiento" class="error-message">{{
                errors.consentimiento
              }}</span>
            </div>

            <div v-if="formError" class="form-error-banner">
              {{ formError }}
            </div>

            <div v-if="submitError" class="form-error-banner">
              {{ submitError }}
            </div>

            <!-- Paso 1: Pre-registro -->
            <button
              v-if="!contactCreated"
              type="submit"
              class="submit-button"
              :disabled="isSubmitting || !selectedLevel"
            >
              {{ isSubmitting ? 'Procesando...' : 'Completar pre-registro' }}
            </button>

            <!-- Paso 2: Pago con MercadoPago -->
            <div v-if="contactCreated" class="payment-section">
              <div class="success-message">
                <h3>✅ Pre-registro exitoso</h3>
                <p>Gracias {{ formData.nombre }}. Ahora podés proceder con el pago.</p>
              </div>

              <div class="payment-summary">
                <h4>Resumen de pago</h4>
                <div class="summary-row">
                  <span>Nivel:</span>
                  <strong>{{ selectedLevel?.name }}</strong>
                </div>
                <div class="summary-row">
                  <span>Monto:</span>
                  <strong>${{ selectedLevel?.amount.toLocaleString() }}</strong>
                </div>
                <div class="summary-row">
                  <span>Beneficio:</span>
                  <strong>{{ benefitAmount }}</strong>
                </div>
              </div>

              <button
                type="button"
                class="payment-button"
                @click="handlePayment"
                :disabled="isProcessingPayment"
              >
                <span v-if="!isProcessingPayment">
                  💳 Pagar con MercadoPago
                </span>
                <span v-else>
                  Abriendo checkout...
                </span>
              </button>

              <p class="payment-note">
                Serás redirigido a MercadoPago para completar el pago de forma segura.
              </p>
            </div>

            <p class="note">
              * Campos obligatorios<br />
              Serás redirigido a nuestro proveedor externo para completar la suscripción
            </p>
          </form>
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
  max-width: 960px;
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

/* section-padding en components.css */
.form-section {
  background-color: #f5f5f5;
}

.form-container {
  background: white;
  border-radius: 8px;
  padding: 3rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

.pre-registration-form h2 {
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

.form-group input.error,
.form-group input[type='checkbox'].error {
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

/* Payment Section Styles */
.payment-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #e0e0e0;
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
  padding: 0.5rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.summary-row:last-child {
  border-bottom: none;
  padding-top: 1rem;
  font-size: 1.1rem;
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

  .levels-grid {
    grid-template-columns: 1fr;
  }
}
</style>
