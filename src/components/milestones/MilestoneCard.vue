<script setup lang="ts">
import { computed } from 'vue';
import type { Milestone } from '@/domain/milestone';

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
</script>

<template>
  <article class="milestone-card" @click="handleCardClick" role="button" tabindex="0" @keydown.enter="handleCardClick" @keydown.space="handleCardClick">
    <h3>{{ props.milestone.name }}</h3>
    <p v-if="props.milestone.description" class="description">{{ props.milestone.description }}</p>
    <div class="progress-container" role="progressbar" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100">
      <div class="progress-bar" :style="{ width: `${progress}%` }"></div>
    </div>
    <dl class="milestone-details">
      <div>
        <dt>Meta</dt>
        <dd>ARS {{ props.milestone.targetAmount.toLocaleString() }}</dd>
      </div>
      <div>
        <dt>Recaudado</dt>
        <dd>ARS {{ props.milestone.raisedAmount.toLocaleString() }} ({{ progress }}%)</dd>
      </div>
      <div>
        <dt>Fecha objetivo</dt>
        <dd>{{ new Date(props.milestone.targetDate).toLocaleDateString() }}</dd>
      </div>
    </dl>
    <div class="card-footer">
      <span class="link-text">Ver detalles →</span>
    </div>
  </article>
</template>

<style scoped>
.milestone-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 24px;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.milestone-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}

.milestone-card:focus-visible {
  outline: 2px solid #2196f3;
  outline-offset: 2px;
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

.progress-container {
  width: 100%;
  height: 10px;
  background-color: #e0e0e0;
  border-radius: 5px;
  margin: 12px 0;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #4caf50;
  transition: width 0.3s ease;
}

.milestone-details {
  display: grid;
  gap: 12px;
  margin: 0;
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

.link-text {
  font-size: 14px;
  color: #2196f3;
  font-weight: 600;
  transition: color 0.2s;
}

.milestone-card:hover .link-text {
  color: #1976d2;
}
</style>
