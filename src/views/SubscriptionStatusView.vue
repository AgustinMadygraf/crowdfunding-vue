<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const subscriptionId = ref(route.params.id as string)

// TODO: Implement API call to GET /api/subscriptions/:id
const subscriptionStatus = ref({
  id: subscriptionId.value,
  status: 'verificacion',
  leadName: 'Usuario Ejemplo',
  levelName: 'Colaborador',
  amount: 25000,
  createdAt: new Date().toISOString(),
  providerStatus: 'pending_verification'
})

const statusLabels: Record<string, string> = {
  interesado: 'Interesado',
  iniciado: 'Iniciado',
  verificacion: 'En verificación',
  confirmado: 'Confirmado',
  rechazado: 'Rechazado',
  expirado: 'Expirado'
}

const statusColors: Record<string, string> = {
  interesado: '#999',
  iniciado: '#3498db',
  verificacion: '#f39c12',
  confirmado: '#42b983',
  rechazado: '#e74c3c',
  expirado: '#95a5a6'
}

onMounted(() => {
  // TODO: Fetch subscription status from API
  console.log('Fetching subscription status for ID:', subscriptionId.value)
})
</script>

<template>
  <div class="subscription-status-view">
    <section class="hero-section">
      <div class="container">
        <h1>Estado de Suscripción</h1>
        <p class="subtitle">ID: {{ subscriptionId }}</p>
      </div>
    </section>

    <section class="status-section">
      <div class="container">
        <div class="status-card">
          <div class="status-header">
            <h2>Estado actual</h2>
            <span
              class="status-badge"
              :style="{ backgroundColor: statusColors[subscriptionStatus.status] }"
            >
              {{ statusLabels[subscriptionStatus.status] }}
            </span>
          </div>

          <div class="status-details">
            <div class="detail-row">
              <span class="label">Nombre:</span>
              <span class="value">{{ subscriptionStatus.leadName }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Nivel:</span>
              <span class="value">{{ subscriptionStatus.levelName }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Monto:</span>
              <span class="value">${{ subscriptionStatus.amount.toLocaleString() }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Fecha de inicio:</span>
              <span class="value">{{
                new Date(subscriptionStatus.createdAt).toLocaleDateString('es-AR')
              }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Estado del proveedor:</span>
              <span class="value">{{ subscriptionStatus.providerStatus }}</span>
            </div>
          </div>

          <div class="status-explanation">
            <h3>¿Qué significa esto?</h3>
            <p v-if="subscriptionStatus.status === 'verificacion'">
              Tu suscripción está siendo verificada por el proveedor externo. Este proceso puede
              tardar entre 24 y 48 horas.
            </p>
            <p v-else-if="subscriptionStatus.status === 'confirmado'">
              ¡Felicitaciones! Tu suscripción ha sido confirmada. Recibirás un email con los
              próximos pasos.
            </p>
            <p v-else-if="subscriptionStatus.status === 'rechazado'">
              Lamentablemente tu suscripción fue rechazada. Por favor contactá a soporte para más
              información.
            </p>
            <p v-else-if="subscriptionStatus.status === 'expirado'">
              Tu solicitud de suscripción ha expirado. Podés iniciar un nuevo proceso.
            </p>
            <p v-else>Tu suscripción está en proceso.</p>
          </div>

          <div class="actions">
            <router-link to="/" class="btn-primary">Volver al inicio</router-link>
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
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
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
}
</style>
