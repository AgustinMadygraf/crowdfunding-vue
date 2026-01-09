<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useContributionLevels } from '@/application/useContributionLevels'
import { getUTMFromSessionStorage, hasUTMParams, type UTMParams } from '@/utils/utm'
import { useFormValidation } from '@/application/composables/useFormValidation'
import { useChatwoot } from '@/application/composables/useChatwoot'
import { subscriptionFormSchema, type SubscriptionFormData } from '@/application/schemas/subscriptionSchema'
import { chatwootClientService } from '@/infrastructure/services/chatwootClientService'

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

// Cargar UTM params al montar el componente
onMounted(() => {
  utmParams.value = getUTMFromSessionStorage()
  if (utmParams.value) {
    console.log('UTM params loaded for subscription:', utmParams.value)
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
    return
  }

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

    // Sincronizar con widget de Chatwoot (setUser + setCustomAttributes)
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

    console.log('Lead registrado en Chatwoot:', sourceId)

    // Mostrar página de éxito
    alert(
      `¡Pre-registro completado!\n\nGracias ${formData.value.nombre}.\nNivel: ${selectedLevel.value?.name}\nEmail: ${formData.value.email}\n\nPróximamente te contactaremos para continuar el proceso.`
    )

    // Limpiar formulario (opcional)
    // formData.value = { ... }
  } catch (error) {
    console.error('Error al registrar en Chatwoot:', error)
    submitError.value = `No pudimos completar tu pre-registro. ${(error as Error).message}`
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="subscribe-view">
    <section class="hero-section">
      <div class="container">
        <h1>Iniciar Suscripción</h1>
        <p class="subtitle">Completá tus datos para continuar con el proceso</p>
      </div>
    </section>

    <section class="form-section">
      <div class="container">
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

            <button
              type="submit"
              class="submit-button"
              :disabled="isSubmitting || !selectedLevel"
            >
              {{ isSubmitting ? 'Procesando...' : 'Continuar a proveedor externo' }}
            </button>

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

.form-section {
  padding: 80px 20px;
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

@media (max-width: 768px) {
  .form-container {
    padding: 2rem 1.5rem;
  }

  .levels-grid {
    grid-template-columns: 1fr;
  }
}
</style>
