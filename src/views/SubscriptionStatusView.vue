<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { contributionsRepository, ContributionRepositoryError } from '@/infrastructure/repositories/ContributionsRepository'

const route = useRoute()
const router = useRouter()

const contributionId = computed(() => route.params.id as string)
const isLoading = ref(false)
const error = ref<string | null>(null)

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
const statusLabels: Record<string, string> = {
  pendiente: 'Pendiente',
  procesando: 'Procesando',
  completado: 'Completado',
  fallido: 'Fallido',
  cancelado: 'Cancelado'
}

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
    error.value = 'ID de contribución inválido o vacío'
    return
  }

  isLoading.value = true
  error.value = null

  try {
    if (import.meta.env.DEV) {
      console.log('[SubscriptionStatus] Cargando contribución:', contributionId.value)
    }
    contribution.value = await contributionsRepository.getByToken(contributionId.value)
    if (import.meta.env.DEV) {
      console.log('[SubscriptionStatus] ✅ Contribución cargada')
    }
  } catch (err) {
    console.error('[SubscriptionStatus] ❌ Error:', err)
    
    if (err instanceof ContributionRepositoryError) {
      if (err.statusCode === 404) {
        error.value = 'No se encontró la contribución solicitada'
      } else if (err.statusCode === 401) {
        error.value = 'No tienes permisos para ver esta contribución'
      } else {
        error.value = err.message || 'Error al cargar la contribución'
      }
    } else {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
    }
  } finally {
    isLoading.value = false
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
  <div class="subscription-status-view">
    <section class="hero-section">
      <div class="container">
        <h1>Estado de Contribución</h1>
        <p class="subtitle" v-if="contributionId">ID: {{ contributionId }}</p>
      </div>
    </section>

    <!-- Loading State -->
    <section v-if="isLoading" class="status-section">
      <div class="container">
        <div class="status-card loading">
          <p>Cargando información de tu contribución...</p>
        </div>
      </div>
    </section>

    <!-- Error State -->
    <section v-else-if="error && !contribution" class="status-section">
      <div class="container">
        <div class="status-card error">
          <h2>Error</h2>
          <p>{{ error }}</p>
          <div class="actions">
            <button @click="retry" class="btn-primary">Reintentar</button>
            <router-link to="/" class="btn-secondary">Volver al inicio</router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Success State -->
    <section v-else-if="contribution" class="status-section">
      <div class="container">
        <div class="status-card">
          <div class="status-header">
            <h2>Estado actual</h2>
            <span
              class="status-badge"
              :style="{ backgroundColor: statusColors[contribution.estado_pago] }"
            >
              {{ statusLabels[contribution.estado_pago] }}
            </span>
          </div>

          <div class="status-details">
            <div class="detail-row">
              <span class="label">Nivel:</span>
              <span class="value">{{ contribution.nivel_nombre }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Monto:</span>
              <span class="value">${{ contribution.monto.toLocaleString('es-AR') }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Fecha de creación:</span>
              <span class="value">{{
                new Date(contribution.created_at).toLocaleDateString('es-AR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              }}</span>
            </div>
            <div v-if="contribution.completed_at" class="detail-row">
              <span class="label">Completado:</span>
              <span class="value">{{
                new Date(contribution.completed_at).toLocaleDateString('es-AR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Token:</span>
              <span class="value token">{{ contribution.token }}</span>
            </div>
          </div>

          <div class="status-explanation">
            <h3>¿Qué significa esto?</h3>
            <p v-if="contribution.estado_pago === 'pendiente'">
              Tu contribución está pendiente de pago. Por favor completa el proceso de pago para confirmar tu participación.
            </p>
            <p v-else-if="contribution.estado_pago === 'procesando'">
              Tu pago está siendo procesado. Este proceso puede tardar algunos minutos. Te notificaremos cuando se complete.
            </p>
            <p v-else-if="contribution.estado_pago === 'completado'">
              ¡Felicitaciones! Tu contribución ha sido confirmada. Recibirás un email con los próximos pasos y detalles de tu participación en el proyecto.
            </p>
            <p v-else-if="contribution.estado_pago === 'fallido'">
              Lamentablemente tu pago no pudo ser procesado. Por favor intenta nuevamente o contacta a soporte para más información.
            </p>
            <p v-else-if="contribution.estado_pago === 'cancelado'">
              Tu contribución fue cancelada. Si deseas participar en el proyecto, puedes iniciar un nuevo proceso de contribución.
            </p>
          </div>

          <div class="actions">
            <router-link 
              v-if="contribution.estado_pago === 'pendiente'" 
              :to="`/suscribir/pago/${contribution.token}`" 
              class="btn-primary"
            >
              Completar Pago
            </router-link>
            <button v-if="contribution.estado_pago === 'procesando'" @click="retry" class="btn-primary">
              Actualizar Estado
            </button>
            <router-link to="/" class="btn-secondary">Volver al inicio</router-link>
            <a href="mailto:info@madypack.com.ar" class="btn-secondary">Contactar soporte</a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.subscription-status-view {
  display: flex;
  flex-direction: column;
  gap: 0;
  min-height: 80vh;
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
  font-size: 1rem;
  opacity: 0.8;
  font-family: monospace;
}

.status-section {
  padding: 80px 20px;
  background-color: #f5f5f5;
}

.status-card {
  background: white;
  border-radius: 8px;
  padding: 3rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-card.loading,
.status-card.error {
  text-align: center;
  padding: 4rem 3rem;
}

.status-card.error {
  border: 2px solid #e74c3c;
}

.status-card.error h2 {
  color: #e74c3c;
  margin-bottom: 1rem;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e0e0e0;
}

.status-header h2 {
  font-size: 1.5rem;
  color: #2c3e50;
}

.status-badge {
  padding: 0.5rem 1.5rem;
  color: white;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.875rem;
}

.status-details {
  margin-bottom: 2rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-row:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #666;
}

.value {
  color: #2c3e50;
}

.value.token {
  font-family: monospace;
  font-size: 0.875rem;
  word-break: break-all;
}

.status-explanation {
  background: #f5f5f5;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.status-explanation h3 {
  font-size: 1.25rem;
  color: #2c3e50;
  margin-bottom: 0.75rem;
}

.status-explanation p {
  color: #666;
  line-height: 1.6;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.btn-primary {
  background: #42b983;
  color: white;
}

.btn-primary:hover {
  background: #359268;
}

.btn-secondary {
  background: white;
  color: #2c3e50;
  border: 2px solid #2c3e50;
}

.btn-secondary:hover {
  background: #2c3e50;
  color: white;
}

@media (max-width: 768px) {
  .status-card {
    padding: 2rem 1.5rem;
  }

  .status-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .detail-row {
    flex-direction: column;
    gap: 0.5rem;
  }

  .actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    text-align: center;
  }
}
</style>
