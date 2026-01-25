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
  <article class="card-base card-clickable milestone-card" @click="handleCardClick" role="button" tabindex="0" @keydown.enter="handleCardClick" @keydown.space="handleCardClick">
    <h3>{{ props.milestone.name }}</h3>
    <p v-if="props.milestone.description" class="description">{{ props.milestone.description }}</p>
    <div class="progress-container" role="progressbar" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100">
      <div class="progress-bar" :style="{ width: `${progress}%` }"></div>
    </div>
    <dl class="milestone-details">
      <div>
        <dt>{{ milestoneCardContent.labels.target }}</dt>
        <dd>{{ content.app.currencyLabel }} {{ props.milestone.targetAmount.toLocaleString() }}</dd>
      </div>
      <div>
        <dt>{{ milestoneCardContent.labels.raised }}</dt>
        <dd>{{ content.app.currencyLabel }} {{ props.milestone.raisedAmount.toLocaleString() }} ({{ progress }}%)</dd>
      </div>
      <div>
        <dt>{{ milestoneCardContent.labels.targetDate }}</dt>
        <dd>{{ new Date(props.milestone.targetDate).toLocaleDateString() }}</dd>
      </div>
    </dl>
    <div class="card-footer">
      <span class="link-text">{{ milestoneCardContent.viewDetailsLabel }}</span>
    </div>
  </article>
</template>

<style scoped>
.milestone-card {
  /* Usa estilos base de components.css */
  display: flex;
  flex-direction: column;
}

h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #111;
}

.description {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

/* progress-container y progress-bar ahora en components.css */

.milestone-details {
  display: grid;
  gap: 12px;
  margin: 12px 0 0 0;
  flex-grow: 1;
}

.milestone-details > div {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 8px;
}

.milestone-details dt {
  font-weight: 600;
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
}

.milestone-details dd {
  margin: 0;
  color: #333;
  font-size: 14px;
}

.card-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
}

/* link-text ahora en components.css */
</style>
