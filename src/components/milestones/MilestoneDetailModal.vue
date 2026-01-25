<!--
Path: src/components/milestones/MilestoneDetailModal.vue
-->

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
          <h2 class="m-0 fs-4 text-dark">{{ milestone.name }}</h2>
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
          <p v-if="milestone.description" class="mb-3 fw-semibold text-body">{{ milestone.description }}</p>

          <!-- Detalles -->
          <div v-if="milestone.details" class="bg-light p-3 rounded mb-4">
            <p class="mb-0 text-body-emphasis">{{ milestone.details }}</p>
          </div>

          <!-- Progress -->
          <div class="mb-4">
            <h3 class="text-uppercase small fw-semibold text-muted mb-2">{{ milestoneModalContent.progressTitle }}</h3>
            <div class="progress-container mb-3">
              <div class="progress-bar" :style="{ width: `${progress}%` }"></div>
            </div>
            <dl class="row g-3 mb-0">
              <div class="col-12 col-md-6">
                <dt class="text-uppercase small fw-semibold text-muted">{{ milestoneModalContent.statsLabels.target }}</dt>
                <dd class="mb-0 fw-semibold text-dark">
                  {{ content.app.currencyLabel }} {{ (milestone.targetAmount || 0).toLocaleString() }}
                </dd>
              </div>
              <div class="col-12 col-md-6">
                <dt class="text-uppercase small fw-semibold text-muted">{{ milestoneModalContent.statsLabels.raised }}</dt>
                <dd class="mb-0 fw-semibold text-dark">
                  {{ content.app.currencyLabel }} {{ (milestone.raisedAmount || 0).toLocaleString() }} ({{ progress }}%)
                </dd>
              </div>
              <div class="col-12 col-md-6">
                <dt class="text-uppercase small fw-semibold text-muted">{{ milestoneModalContent.statsLabels.targetDate }}</dt>
                <dd class="mb-0 fw-semibold text-dark">
                  {{ new Date(milestone.targetDate).toLocaleDateString('es-AR') }}
                </dd>
              </div>
              <div class="col-12 col-md-6">
                <dt class="text-uppercase small fw-semibold text-muted">{{ milestoneModalContent.statsLabels.status }}</dt>
                <dd class="mb-0">
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
          <div v-if="milestone.timeline?.length" class="mb-4">
            <h3 class="text-uppercase small fw-semibold text-muted mb-3">{{ milestoneModalContent.timelineTitle }}</h3>
            <ul class="list-unstyled m-0 d-grid gap-3">
              <li v-for="(item, idx) in milestone.timeline" :key="idx" class="d-flex gap-3">
                <div class="timeline-marker" :class="item.status"></div>
                <div class="timeline-content" :class="item.status">
                  <time class="d-block small text-muted mb-1">
                    {{ new Date(item.date).toLocaleDateString('es-AR') }}
                  </time>
                  <h4 class="h6 mb-1 fw-semibold text-dark">{{ item.title }}</h4>
                  <p class="mb-0 small text-muted">{{ item.description }}</p>
                </div>
              </li>
            </ul>
          </div>

          <!-- Evidencias -->
          <div v-if="milestone.evidences?.length" class="mb-4">
            <h3 class="text-uppercase small fw-semibold text-muted mb-3">{{ milestoneModalContent.evidencesTitle }}</h3>
            <ul class="list-unstyled m-0 d-grid gap-2">
              <li v-for="evidence in milestone.evidences" :key="evidence.id" class="bg-light rounded p-3">
                <a
                  :href="evidence.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="d-flex align-items-center gap-2 text-decoration-none link-primary"
                >
                  <i class="bi bi-file-earmark-text text-muted" aria-hidden="true"></i>
                  <span class="flex-grow-1 fw-semibold">{{ evidence.title }}</span>
                  <span v-if="evidence.version" class="small text-muted">v{{ evidence.version }}</span>
                </a>
                <p v-if="evidence.description" class="mb-0 mt-2 small text-muted">
                  {{ evidence.description }}
                </p>
              </li>
            </ul>
          </div>

          <!-- Responsable -->

          <div v-if="milestone.responsible" class="mb-4">
            <h3 class="text-uppercase small fw-semibold text-muted mb-2">{{ milestoneModalContent.responsibleTitle }}</h3>
            <p class="mb-0 text-body-emphasis">{{ milestone.responsible }}</p>
          </div>

          <!-- Dependencias -->
          <div v-if="milestone.dependencies?.length" class="mb-4">
            <h3 class="text-uppercase small fw-semibold text-muted mb-2">{{ milestoneModalContent.dependenciesTitle }}</h3>
            <p class="mb-0 text-muted">
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
