<!--
Path: src/components/updates/UpdateCard.vue
-->

<script setup lang="ts">
import type { Update } from '@/domain/update';
import { content } from '@/infrastructure/content';

const props = defineProps<{
  update: Update;
}>();

const categoryColors: Record<string, string> = {
  comercial: 'var(--category-comercial)',
  tecnico: 'var(--category-tecnico)',
  logistica: 'var(--category-logistica)',
  legal: 'var(--category-legal)',
};

const categoryLabels = content.home.updateCard.categoryLabels;

const formattedDate = new Date(props.update.publishedAt).toLocaleDateString('es-AR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
</script>

<template>
  <article class="card shadow-sm p-3 d-flex flex-column h-100 border-start border-4 border-transparent cursor-pointer update-card">
    <div class="d-flex justify-content-between align-items-center gap-3 mb-3">
      <span 
        class="badge"
        :style="{ backgroundColor: categoryColors[update.category] }"
      >
        {{ categoryLabels[update.category] }}
      </span>
      <time class="small text-muted text-nowrap">{{ formattedDate }}</time>
    </div>

    <h3 class="h5 fw-bold mb-3 text-truncate-2">{{ update.title }}</h3>
    
    <p v-if="update.excerpt" class="text-muted mb-0 text-truncate-3 flex-grow-1">{{ update.excerpt }}</p>

    <div class="mt-3 pt-3 border-top d-flex justify-content-end">
      <span class="text-primary fw-semibold">{{ content.home.updateCard.readMoreLabel }}</span>
    </div>
  </article>
</template>
