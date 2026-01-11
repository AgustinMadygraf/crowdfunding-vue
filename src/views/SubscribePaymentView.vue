<template>
  <div class="subscribe-payment-container">
    <!-- Header -->
    <div class="payment-header">
      <h1>Tu Página de Contribución</h1>
      <p v-if="user" class="user-greeting">Hola, {{ user.nombre }}</p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading">
      <p>Cargando información de tu contribución...</p>
    </div>

    <!-- Error State -->
    <div v-if="error && !isLoading" class="error-banner">
      {{ error }}
      <button @click="loadContribution" class="retry-btn">Reintentar</button>
    </div>

    <!-- Contribution Details -->
    <div v-if="contribution && !isLoading" class="contribution-card">
      <div class="card-header">
        <h2>Detalles de tu Contribución</h2>
        <span :class="['status-badge', `status-${contribution.estado_pago}`]">
          {{ getStatusLabel(contribution.estado_pago) }}
        </span>
      </div>

      <div class="contribution-details">
        <div class="detail-row">
          <span class="label">Nivel:</span>
          <span class="value">{{ contribution.nivel_nombre }}</span>
        </div>

        <div class="detail-row">
          <span class="label">Monto:</span>
          <span class="value">$ {{ formatAmount(contribution.monto) }}</span>
        </div>

        <div class="detail-row">
          <span class="label">Fecha de Creación:</span>
          <span class="value">{{ formatDate(contribution.created_at) }}</span>
        </div>

        <div v-if="contribution.completed_at" class="detail-row">
          <span class="label">Pago Completado:</span>
          <span class="value">{{ formatDate(contribution.completed_at) }}</span>
        </div>

        <div class="detail-row">
          <span class="label">Token:</span>
          <span class="value token">{{ contribution.token }}</span>
        </div>
      </div>

      <!-- Payment Section -->
      <div class="payment-section">
        <!-- Pending Payment -->
        <div v-if="contribution.estado_pago === 'pendiente'" class="pending-payment">
          <h3>Completar Pago</h3>
          <p>Tu pago aún está pendiente. Haz clic en el botón de abajo para continuar.</p>
          
          <button 
            @click="initiatePayment"
            class="mercadopago-button"
            :disabled="isProcessing"
          >
            {{ isProcessing ? 'Procesando...' : 'Ir a MercadoPago' }}
          </button>
        </div>

        <!-- Processing Payment -->
        <div v-if="contribution.estado_pago === 'procesando'" class="processing-payment">
          <h3>Pago en Proceso</h3>
          <p>Tu pago se está procesando. Por favor espera.</p>
          <button @click="loadContribution" class="secondary-button">
            Actualizar Estado
          </button>
        </div>

        <!-- Completed Payment -->
        <div v-if="contribution.estado_pago === 'completado'" class="completed-payment">
          <h3>✓ Pago Completado</h3>
          <p>¡Gracias por tu contribución! Tu pago se ha procesado correctamente.</p>
          <p class="secondary-text">
            Recibirás un email de confirmación en breve.
          </p>
        </div>

        <!-- Failed Payment -->
        <div v-if="contribution.estado_pago === 'fallido'" class="failed-payment">
          <h3>❌ Pago Fallido</h3>
          <p>Hubo un problema procesando tu pago. Por favor intenta de nuevo.</p>
          <button 
            @click="initiatePayment"
            class="mercadopago-button"
            :disabled="isProcessing"
          >
            {{ isProcessing ? 'Procesando...' : 'Reintentar Pago' }}
          </button>
        </div>

        <!-- Cancelled Payment -->
        <div v-if="contribution.estado_pago === 'cancelado'" class="cancelled-payment">
          <h3>Pago Cancelado</h3>
          <p>Tu pago fue cancelado. Puedes reintentarlo si lo deseas.</p>
          <button 
            @click="initiatePayment"
            class="mercadopago-button"
            :disabled="isProcessing"
          >
            {{ isProcessing ? 'Procesando...' : 'Reintenta tu Pago' }}
          </button>
        </div>
      </div>

      <!-- Info Box -->
      <div class="info-box">
        <p>
          <strong>¿Necesitas ayuda?</strong> 
          Si tienes problemas completando tu pago, contáctanos a través del chat en la esquina inferior derecha.
        </p>
      </div>
    </div>

    <!-- Not Found State -->
    <div v-if="!isLoading && !contribution && !error" class="not-found">
      <p>No se encontró la contribución solicitada.</p>
      <router-link to="/subscribe" class="link">
        ← Volver a suscripción
      </router-link>
    </div>

    <!-- Unauthenticated Info -->
    <div v-if="showAuthInfo" class="auth-info">
      <p>
        Si eres el usuario registrado, puedes 
        <router-link to="/account">ir a tu dashboard</router-link> 
        para ver todas tus contribuciones.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { authService } from '@/infrastructure/services/authServiceFactory'
import type { User } from '@/domain/user'

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
  if (!token.value) {
    error.value = 'Token de contribución inválido'
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
    const headers = authService.getAuthHeaders()
    // Evitar preflight CORS en GET: eliminar Content-Type
    if (headers['Content-Type']) {
      delete headers['Content-Type']
    }

    console.log('[SubscribePayment] 🔄 Cargando contribución por token (GET):', token.value)
    console.log('[SubscribePayment] 🌐 Endpoint:', `${apiBaseUrl}/api/contributions/${token.value}`)

    const response = await fetch(`${apiBaseUrl}/api/contributions/${token.value}`, {
      method: 'GET',
      headers,
      // Asegurar modo CORS explícito
      mode: 'cors'
    })

    if (!response.ok) {
      console.warn('[SubscribePayment] ⚠️ Respuesta no OK del backend:', response.status, response.statusText)
      throw new Error('No se pudo cargar la contribución')
    }

    try {
      contribution.value = await response.json()
    } catch (parseErr) {
      console.error('[SubscribePayment] ❌ Error al parsear JSON de contribución:', parseErr)
      throw new Error('Respuesta del servidor inválida')
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error desconocido'
    console.error('[SubscribePayment] ❌ Error cargando contribución:', err)
    // Pistas específicas para CORS/preflight
    if (err instanceof TypeError) {
      console.warn('[SubscribePayment] ⚠️ Posible bloqueo CORS/preflight en GET')
      console.warn('[SubscribePayment] 💡 Sugerencias:')
      console.warn('   • Verificar que el backend responda OPTIONS en /api/contributions/:token')
      console.warn('   • Habilitar CORS para métodos GET y headers enviados')
      console.warn('   • Revisar consola del servidor para códigos 404/500 en OPTIONS')
    }
  } finally {
    isLoading.value = false
  }
}

/**
 * Inicia el proceso de pago en MercadoPago
 */
const initiatePayment = async () => {
  if (!contribution.value?.mercadopago_preference_id) {
    error.value = 'No se pudo cargar la información de pago'
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
    error.value = err instanceof Error ? err.message : 'Error al iniciar pago'
    console.error('[SubscribePayment] Error initiating payment:', err)
  } finally {
    isProcessing.value = false
  }
}

/**
 * Obtiene la etiqueta de estado
 */
const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pendiente: '⏳ Pendiente',
    procesando: '🔄 Procesando',
    completado: '✅ Completado',
    fallido: '❌ Fallido',
    cancelado: '⚠️ Cancelado'
  }
  return labels[status] || status
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

/**
 * Carga usuario actual si está autenticado
 */
onMounted(() => {
  user.value = authService.getCurrentUser()
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

.loading,
.error-banner,
.not-found {
  padding: 1.5rem;
  border-radius: 0.5rem;
  text-align: center;
}

.loading {
  background: var(--color-background-soft);
  color: var(--color-text-secondary);
}

.error-banner {
  background: #fee;
  border: 1px solid #fcc;
  color: #c00;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.retry-btn {
  padding: 0.5rem 1rem;
  background: #c00;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.retry-btn:hover {
  background: #a00;
}

.not-found {
  background: var(--color-background-soft);
  color: var(--color-text-secondary);
}

.not-found .link {
  color: var(--color-primary);
  text-decoration: none;
  margin-top: 1rem;
  display: inline-block;
}

.contribution-card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--color-text);
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-pendiente {
  background: #fef3cd;
  color: #856404;
}

.status-procesando {
  background: #d1ecf1;
  color: #0c5460;
}

.status-completado {
  background: #d4edda;
  color: #155724;
}

.status-fallido {
  background: #f8d7da;
  color: #721c24;
}

.status-cancelado {
  background: #fff3cd;
  color: #856404;
}

.contribution-details {
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
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

.payment-section {
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
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

.mercadopago-button,
.secondary-button {
  margin-top: 1rem;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.mercadopago-button {
  background: #009ee3;
  color: white;
}

.mercadopago-button:hover:not(:disabled) {
  background: #007ab8;
}

.mercadopago-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.secondary-button {
  background: var(--color-background-soft);
  color: var(--color-text);
  border: 1px solid #ddd;
}

.secondary-button:hover {
  background: #e8e8e8;
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

.info-box {
  padding: 1rem;
  background: #f0f8ff;
  border-left: 4px solid #009ee3;
  color: var(--color-text);
}

.info-box p {
  margin: 0;
  font-size: 0.875rem;
}

.auth-info {
  margin-top: 2rem;
  padding: 1rem;
  background: var(--color-background-soft);
  border-radius: 0.5rem;
  text-align: center;
  color: var(--color-text-secondary);
}

.auth-info a {
  color: var(--color-primary);
  text-decoration: none;
}

.auth-info a:hover {
  text-decoration: underline;
}
</style>
