<script setup lang="ts">
import { computed } from 'vue';
import type { Milestone } from '@/domain/milestone';

const props = defineProps<{
  milestone: Milestone;
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
</script>

<template>
  <article class="milestone-card">
    <h3>{{ props.milestone.name }}</h3>
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
  </article>
</template>

<style scoped>
.milestone-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 24px;
  transition: transform 0.3s ease;
}

.milestone-card:hover {
  transform: translateY(-4px);
}

.progress-container {
  width: 100%;
  height: 10px;
  background-color: #e0e0e0;
  border-radius: 5px;
  margin: 16px 0;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #4caf50;
}

.milestone-details {
  display: grid;
  gap: 12px;
  margin: 0;
}

.milestone-details > div {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 8px;
}

dt {
  font-weight: 600;
  color: #555;
}

dd {
  margin: 0;
  color: #111;
}
</style>
