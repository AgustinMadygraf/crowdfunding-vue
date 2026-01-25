<!--
Path: src/components/milestones/MilestoneCard.vue
-->

<script setup lang="ts">
import { computed } from 'vue';
import type { Milestone } from '@/domain/milestone';
import { content } from '@/infrastructure/content';

const props = defineProps<{
  milestone: Milestone;
}>();

const emit = defineEmits<{
  'show-details': [milestone: Milestone];
}>();

const progress = computed(() => {
  if (props.milestone.targetAmount === 0) {
    return 0;
  }

  return Math.min(
    Math.round((props.milestone.raisedAmount / props.milestone.targetAmount) * 100),
    100,
  );
});

const handleCardClick = () => {
  emit('show-details', props.milestone);
};

const milestoneCardContent = content.home.milestoneCard;
</script>

<template>
  <article class="card shadow-sm p-3 d-flex flex-column cursor-pointer" @click="handleCardClick" role="button" tabindex="0" @keydown.enter="handleCardClick" @keydown.space="handleCardClick">
    <h3 class="h5 mb-2">{{ props.milestone.name }}</h3>
    <p v-if="props.milestone.description" class="text-muted small mb-3">{{ props.milestone.description }}</p>
    <div class="progress-container" role="progressbar" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100">
      <div class="progress-bar" :style="{ width: `${progress}%` }"></div>
    </div>
    <dl class="d-grid gap-3 mt-3 mb-0 flex-grow-1">
      <div>
        <dt class="text-uppercase text-muted small fw-semibold">{{ milestoneCardContent.labels.target }}</dt>
        <dd class="mb-0">{{ content.app.currencyLabel }} {{ props.milestone.targetAmount.toLocaleString() }}</dd>
      </div>
      <div>
        <dt class="text-uppercase text-muted small fw-semibold">{{ milestoneCardContent.labels.raised }}</dt>
        <dd class="mb-0">{{ content.app.currencyLabel }} {{ props.milestone.raisedAmount.toLocaleString() }} ({{ progress }}%)</dd>
      </div>
      <div>
        <dt class="text-uppercase text-muted small fw-semibold">{{ milestoneCardContent.labels.targetDate }}</dt>
        <dd class="mb-0">{{ new Date(props.milestone.targetDate).toLocaleDateString() }}</dd>
      </div>
    </dl>
    <div class="mt-3 pt-3 border-top d-flex justify-content-end">
      <span class="text-primary fw-semibold">{{ milestoneCardContent.viewDetailsLabel }}</span>
    </div>
  </article>
</template>
