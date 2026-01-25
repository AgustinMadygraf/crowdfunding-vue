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
  <article class="card shadow-sm p-3 update-card cursor-pointer">
    <div class="update-header">
      <span 
        class="badge"
        :style="{ backgroundColor: categoryColors[update.category] }"
      >
        {{ categoryLabels[update.category] }}
      </span>
      <time class="date">{{ formattedDate }}</time>
    </div>

    <h3 class="title">{{ update.title }}</h3>
    
    <p v-if="update.excerpt" class="excerpt">{{ update.excerpt }}</p>

    <div class="card-footer">
      <span class="text-primary fw-semibold">{{ content.home.updateCard.readMoreLabel }}</span>
    </div>
  </article>
</template>

<style scoped>
.update-card {
  /* Usa card de Bootstrap */
  display: flex;
  flex-direction: column;
  height: 100%;
  border-left: 4px solid transparent;
}

.update-card:hover {
  border-left-color: var(--color-primary);
}

.update-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
}

/* badge y text utilities en Bootstrap */

.date {
  font-size: 13px;
  color: #999;
  white-space: nowrap;
}

.title {
  margin: 0 0 12px 0;
  font-size: 20px;
  font-weight: 700;
  color: #111;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.excerpt {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  flex-grow: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* card-footer ahora en components.css */

@media (max-width: 600px) {
  .title {
    font-size: 18px;
  }

  .excerpt {
    font-size: 13px;
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }
}
</style>
