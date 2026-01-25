<script setup lang="ts">
import { computed } from 'vue';
import type { Milestone } from '@/domain/milestone';
import { content } from '@/infrastructure/content';

const props = defineProps<{
  milestone: Milestone;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const progress = computed(() => {
  if ((props.milestone.targetAmount || 0) === 0) return 0;
  return Math.min(
    Math.round(((props.milestone.raisedAmount || 0) / (props.milestone.targetAmount || 1)) * 100),
    100,
  );
});

const statusBadgeClass = computed(() => {
  const map: Record<string, string> = {
    active: 'text-bg-success',
    pending: 'text-bg-warning',
    completed: 'text-bg-success'
  };
  return map[props.milestone.status] || 'text-bg-secondary';
});

const handleBackdropClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) {
    emit('close');
  }
};

const milestoneModalContent = content.home.milestoneModal;
</script>

<template>
  <teleport to="body">
    <div v-if="isOpen" class="modal-backdrop" @click="handleBackdropClick">
      <div
        class="modal-content"
        role="dialog"
        aria-modal="true"
        :aria-label="`${milestoneModalContent.ariaLabelPrefix} ${milestone.name}`"
      >
        <!-- Header -->
        <header class="modal-header">
          <h2>{{ milestone.name }}</h2>
          <button
            type="button"
            class="btn-close"
            :aria-label="milestoneModalContent.closeLabel"
            @click="$emit('close')"
          ></button>
        </header>

        <!-- Body -->
        <div class="modal-body">
          <!-- Descripción -->
          <p v-if="milestone.description" class="description">{{ milestone.description }}</p>

          <!-- Detalles -->
          <div v-if="milestone.details" class="details">
            <p>{{ milestone.details }}</p>
          </div>

          <!-- Progress -->
          <div class="progress-section">
            <h3>{{ milestoneModalContent.progressTitle }}</h3>
            <div class="progress-container">
              <div class="progress-bar" :style="{ width: `${progress}%` }"></div>
            </div>
            <dl class="stats">
              <div>
                <dt>{{ milestoneModalContent.statsLabels.target }}</dt>
                <dd>{{ content.app.currencyLabel }} {{ (milestone.targetAmount || 0).toLocaleString() }}</dd>
              </div>
              <div>
                <dt>{{ milestoneModalContent.statsLabels.raised }}</dt>
                <dd>{{ content.app.currencyLabel }} {{ (milestone.raisedAmount || 0).toLocaleString() }} ({{ progress }}%)</dd>
              </div>
              <div>
                <dt>{{ milestoneModalContent.statsLabels.targetDate }}</dt>
                <dd>{{ new Date(milestone.targetDate).toLocaleDateString('es-AR') }}</dd>
              </div>
              <div>
                <dt>{{ milestoneModalContent.statsLabels.status }}</dt>
                <dd>
                  <span class="badge" :class="statusBadgeClass">
                    {{
                      milestone.status === 'active'
                        ? milestoneModalContent.statusLabels.active
                        : milestone.status === 'pending'
                          ? milestoneModalContent.statusLabels.pending
                          : milestoneModalContent.statusLabels.completed
                    }}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <!-- Timeline -->
          <div v-if="milestone.timeline?.length" class="timeline-section">
            <h3>{{ milestoneModalContent.timelineTitle }}</h3>
            <ul class="timeline">
              <li v-for="(item, idx) in milestone.timeline" :key="idx" class="timeline-item">
                <div class="timeline-marker" :class="`status-${item.status}`"></div>
                <div class="timeline-content">
                  <time class="timeline-date">{{ new Date(item.date).toLocaleDateString('es-AR') }}</time>
                  <h4 class="timeline-title">{{ item.title }}</h4>
                  <p class="timeline-description">{{ item.description }}</p>
                </div>
              </li>
            </ul>
          </div>

          <!-- Evidencias -->
          <div v-if="milestone.evidences?.length" class="evidences-section">
            <h3>{{ milestoneModalContent.evidencesTitle }}</h3>
            <ul class="evidences-list">
              <li v-for="evidence in milestone.evidences" :key="evidence.id" class="evidence-item">
                <a :href="evidence.url" target="_blank" rel="noopener noreferrer" class="evidence-link">
                  <span class="evidence-icon">📄</span>
                  <span class="evidence-title">{{ evidence.title }}</span>
                  <span v-if="evidence.version" class="evidence-version">v{{ evidence.version }}</span>
                </a>
                <p v-if="evidence.description" class="evidence-description">{{ evidence.description }}</p>
              </li>
            </ul>
          </div>

          <!-- Responsable -->
          <div v-if="milestone.responsible" class="responsible-section">
            <h3>{{ milestoneModalContent.responsibleTitle }}</h3>
            <p>{{ milestone.responsible }}</p>
          </div>

          <!-- Dependencias -->
          <div v-if="milestone.dependencies?.length" class="dependencies-section">
            <h3>{{ milestoneModalContent.dependenciesTitle }}</h3>
            <p class="text-muted">
              {{ milestoneModalContent.dependenciesPrefix }} {{ milestone.dependencies.join(', ') }}
            </p>
          </div>
        </div>

        <!-- Footer -->
        <footer class="modal-footer">
          <router-link :to="`/etapas/${milestone.id}`" class="btn btn-primary">
            {{ milestoneModalContent.footerLabels.details }}
          </router-link>
          <button class="btn btn-secondary" @click="$emit('close')">
            {{ milestoneModalContent.footerLabels.close }}
          </button>
        </footer>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
/* modal-backdrop, modal-content, modal-header, modal-body, modal-footer en components.css */

.modal-header h2 {
  margin: 0;
  font-size: 24px;
  color: #111;
}

.description {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0 0 16px 0;
}

.details {
  background-color: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  line-height: 1.6;
}

.details p {
  margin: 0;
  color: #555;
}

/* Progress Section */
.progress-section {
  margin-bottom: 32px;
}

.progress-section h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  color: #666;
}

/* progress-container y progress-bar en components.css */
.progress-bar-container {
  margin-bottom: 16px;
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin: 0;
}

.stats > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stats dt {
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  color: #999;
}

.stats dd {
  margin: 0;
  font-size: 16px;
  color: #111;
  font-weight: 500;
}

/* Timeline */
.timeline-section {
  margin-bottom: 32px;
}

.timeline-section h3 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  color: #666;
}

.timeline {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* timeline-marker, timeline-content en components.css */

.timeline-item {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  position: relative;
}

.timeline-marker {
  margin-top: 4px;
}

.timeline-date {
  display: block;
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.timeline-title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #111;
}

.timeline-description {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

/* Evidencias */
.evidences-section {
  margin-bottom: 32px;
}

.evidences-section h3 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  color: #666;
}

.evidences-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.evidence-item {
  background-color: #f5f5f5;
  padding: 12px;
  border-radius: 8px;
}

.evidence-link {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #2196f3;
  text-decoration: none;
  transition: color 0.2s;
}

.evidence-link:hover {
  color: #1976d2;
  text-decoration: underline;
}

.evidence-icon {
  font-size: 20px;
}

.evidence-title {
  flex: 1;
  font-weight: 500;
}

.evidence-version {
  font-size: 12px;
  color: #999;
}

.evidence-description {
  margin: 8px 0 0 32px;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

/* Other sections */
.responsible-section,
.dependencies-section {
  margin-bottom: 24px;
}

.responsible-section h3,
.dependencies-section h3 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #666;
}

.responsible-section p,
.dependencies-section p {
  margin: 0;
  color: #333;
}

.text-muted {
  color: #999;
}

/* Footer */
.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
  background-color: #f9fafb;
  justify-content: flex-end;
}

/* btn-primary, btn-secondary en Bootstrap */

@media (max-width: 600px) {
  .modal-content {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .stats {
    grid-template-columns: 1fr;
  }
}
</style>
