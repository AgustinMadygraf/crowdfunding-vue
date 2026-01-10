<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMilestones } from '@/application/useMilestones';

const route = useRoute();
const router = useRouter();
const { milestones } = useMilestones();

const milestoneId = computed(() => Number(route.params.id));

const milestone = computed(() => {
  return milestones.value.find((m) => m.id === milestoneId.value);
});

const progress = computed(() => {
  if (!milestone.value || (milestone.value.targetAmount || 0) === 0) return 0;
  return Math.min(
    Math.round(((milestone.value.raisedAmount || 0) / (milestone.value.targetAmount || 1)) * 100),
    100,
  );
});

const dependentMilestones = computed(() => {
  if (!milestone.value?.dependencies?.length) return [];
  return milestones.value.filter((m) => milestone.value!.dependencies?.includes(m.id));
});

const dependentOnThis = computed(() => {
  if (!milestone.value?.id) return [];
  return milestones.value.filter((m) => m.dependencies?.includes(milestone.value!.id));
});

onMounted(() => {
  if (milestone.value && milestone.value.name) {
    document.title = `${milestone.value.name} - Madypack`;
  }
});

const handleGoBack = () => {
  router.back();
};
</script>

<template>
  <div v-if="milestone" class="milestone-detail-page">
    <!-- Header -->
    <header class="header">
      <div class="container-narrow">
        <button class="btn-back" @click="handleGoBack" aria-label="Volver">
          ← Volver
        </button>
        <h1>{{ milestone.name }}</h1>
        <p v-if="milestone.description" class="subtitle">{{ milestone.description }}</p>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container-narrow">
      <!-- Detalles -->
      <section class="section">
        <h2>Información general</h2>
        <div class="content-grid">
          <div v-if="milestone.details" class="card-base">
            <h3>Descripción detallada</h3>
            <p>{{ milestone.details }}</p>
          </div>

          <div class="card-base">
            <h3>Estado del proyecto</h3>
            <dl class="stats">
              <div>
                <dt>Meta de recaudación</dt>
                <dd>ARS {{ (milestone.targetAmount || 0).toLocaleString() }}</dd>
              </div>
              <div>
                <dt>Recaudado hasta ahora</dt>
                <dd>ARS {{ (milestone.raisedAmount || 0).toLocaleString() }}</dd>
              </div>
              <div>
                <dt>Progreso</dt>
                <dd>
                  <div class="progress-container">
                    <div class="progress-bar" :style="{ width: `${progress}%` }"></div>
                  </div>
                  <span class="progress-text">{{ progress }}%</span>
                </dd>
              </div>
              <div>
                <dt>Fecha objetivo</dt>
                <dd>{{ new Date(milestone.targetDate).toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</dd>
              </div>
              <div>
                <dt>Estado actual</dt>
                <dd>
                  <span class="badge-status" :class="`status-${milestone.status}`">
                    {{ milestone.status === 'active' ? 'En progreso' : milestone.status === 'pending' ? 'Pendiente' : 'Completada' }}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <!-- Timeline -->
      <section v-if="milestone.timeline?.length" class="section">
        <h2>Línea de tiempo</h2>
        <div class="timeline">
          <div v-for="(item, idx) in milestone.timeline" :key="idx" class="timeline-item">
            <div class="timeline-marker" :class="`status-${item.status}`"></div>
            <div class="timeline-content">
              <time class="timeline-date">{{ new Date(item.date).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' }) }}</time>
              <h4 class="timeline-title">{{ item.title }}</h4>
              <p class="timeline-description">{{ item.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Evidencias -->
      <section v-if="milestone.evidences?.length" class="section">
        <h2>Documentos y evidencias</h2>
        <div class="evidences-grid">
          <a
            v-for="evidence in milestone.evidences"
            :key="evidence.id"
            :href="evidence.url"
            target="_blank"
            rel="noopener noreferrer"
            class="evidence-card"
          >
            <div class="evidence-icon">📄</div>
            <h3>{{ evidence.title }}</h3>
            <p v-if="evidence.description" class="evidence-description">{{ evidence.description }}</p>
            <span v-if="evidence.version" class="evidence-version">v{{ evidence.version }}</span>
          </a>
        </div>
      </section>

      <!-- Responsable -->
      <section v-if="milestone.responsible" class="section">
        <h2>Responsable</h2>
        <div class="card">
          <p>{{ milestone.responsible }}</p>
        </div>
      </section>

      <!-- Dependencias -->
      <section v-if="dependentMilestones.length" class="section">
        <h2>Etapas previas requeridas</h2>
        <div class="related-milestones">
          <div v-for="m in dependentMilestones" :key="m.id" class="milestone-link">
            <router-link :to="`/etapas/${m.id}`">
              {{ m.name }}
              <span class="arrow">→</span>
            </router-link>
          </div>
        </div>
      </section>

      <!-- Siguientes etapas -->
      <section v-if="dependentOnThis.length" class="section">
        <h2>Etapas que dependen de esta</h2>
        <div class="related-milestones">
          <div v-for="m in dependentOnThis" :key="m.id" class="milestone-link">
            <router-link :to="`/etapas/${m.id}`">
              {{ m.name }}
              <span class="arrow">→</span>
            </router-link>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="section cta-section">
        <div class="cta-card">
          <h2>¿Quieres apoyar esta etapa?</h2>
          <p>Ingresá con Google y elegí tu nivel de contribución.</p>
          <router-link to="/suscribir" class="btn btn-primary">
            Comenzar a contribuir
          </router-link>
        </div>
      </section>
    </main>
  </div>

  <!-- 404 -->
  <div v-else class="not-found">
    <div class="container">
      <h1>Etapa no encontrada</h1>
      <p>No pudimos encontrar la información de esta etapa.</p>
      <router-link to="/etapas" class="btn btn-primary">Volver al panel de etapas</router-link>
    </div>
  </div>
</template>

<style scoped>
.milestone-detail-page {
  min-height: 100vh;
  background-color: #f9fafb;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
  padding: 40px 20px;
  margin-bottom: 40px;
}

/* container-narrow en components.css */

.btn-back {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  margin-bottom: 12px;
}

.btn-back:hover {
  text-decoration: underline;
}

.header h1 {
  margin: 0 0 8px 0;
  font-size: 36px;
  color: #111;
}

.subtitle {
  margin: 0;
  font-size: 16px;
  color: #666;
  line-height: 1.6;
}

/* container-narrow en components.css */

.section {
  margin-bottom: 48px;
}

.section h2 {
  margin-bottom: 24px;
  font-size: 24px;
  color: #111;
  border-bottom: 2px solid var(--color-primary);
  padding-bottom: 12px;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

/* card-base en components.css */
.card-base h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.card-base p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 0;
}

.stats > div {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.stats dt {
  font-weight: 500;
  color: #666;
  font-size: 14px;
}

.stats dd {
  margin: 0;
  font-weight: 600;
  color: #111;
  text-align: right;
}

/* progress-container, progress-bar en components.css */
.progress-container {
  margin: 8px 0;
}

.progress-text {
  font-size: 12px;
  color: #999;
}

/* badge-status en components.css */

/* Timeline - usa timeline-marker y timeline-content de components.css */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.timeline-item {
  display: flex;
  gap: 16px;
  position: relative;
}

.timeline-marker {
  margin-top: 2px;
}

.timeline-content {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  border-left: 3px solid #e0e0e0;
}

.timeline-item:has(.status-completed) .timeline-content {
  border-left-color: var(--color-success);
}

.timeline-item:has(.status-in-progress) .timeline-content {
  border-left-color: var(--color-primary);
}

.timeline-item:has(.status-pending) .timeline-content {
  border-left-color: var(--color-warning-light);
}

.timeline-date {
  display: block;
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.timeline-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #111;
}

.timeline-description {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

/* Evidencias Grid */
.evidences-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.evidence-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  text-decoration: none;
  transition: all 0.2s;
  border: 2px solid #e0e0e0;
}

.evidence-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.2);
  transform: translateY(-2px);
}

.evidence-icon {
  font-size: 32px;
  margin-bottom: 8px;
  display: block;
}

.evidence-card h3 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #111;
  line-height: 1.4;
}

.evidence-description {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.evidence-version {
  display: block;
  font-size: 11px;
  color: #999;
  margin-top: 8px;
}

/* Related Milestones */
.related-milestones {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.milestone-link a {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #fff;
  border-radius: 8px;
  color: var(--color-primary);
  text-decoration: none;
  transition: all 0.2s;
  border-left: 4px solid var(--color-primary);
}

.milestone-link a:hover {
  background-color: #f5f5f5;
  text-decoration: underline;
}

.arrow {
  margin-left: 12px;
}

/* CTA Section */
.cta-section {
  margin-bottom: 60px;
}

.cta-card {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  color: white;
}

.cta-card h2 {
  color: white;
  border-bottom: none;
  margin-bottom: 12px;
  padding-bottom: 0;
}

.cta-card p {
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 24px 0;
  font-size: 16px;
  line-height: 1.6;
}

/* btn-primary en components.css */
.btn {
  display: inline-flex;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.cta-card .btn-primary {
  background-color: white;
  color: var(--color-primary);
}

.cta-card .btn-primary:hover {
  background-color: #f5f5f5;
}

/* Not Found */
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}

.not-found h1 {
  font-size: 32px;
  margin-bottom: 12px;
}

.not-found p {
  color: #666;
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .header {
    padding: 20px;
  }

  .header h1 {
    font-size: 24px;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .evidences-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .section h2 {
    font-size: 20px;
  }

  .cta-card {
    padding: 24px;
  }

  .cta-card .btn {
    width: 100%;
  }
}
</style>
