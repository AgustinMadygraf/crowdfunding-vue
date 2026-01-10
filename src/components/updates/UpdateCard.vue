<script setup lang="ts">
import type { Update } from '@/domain/update';

const props = defineProps<{
  update: Update;
}>();

const categoryColors: Record<string, string> = {
  comercial: 'var(--category-comercial)',
  tecnico: 'var(--category-tecnico)',
  logistica: 'var(--category-logistica)',
  legal: 'var(--category-legal)',
};

const categoryLabels: Record<string, string> = {
  comercial: 'Comercial',
  tecnico: 'Técnico',
  logistica: 'Logística',
  legal: 'Legal',
};

const formattedDate = new Date(props.update.publishedAt).toLocaleDateString('es-AR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
</script>

<template>
  <article class="card-base card-clickable update-card">
    <div class="update-header">
      <span 
        class="badge-category" 
        :style="{ backgroundColor: categoryColors[update.category] }"
      >
        {{ categoryLabels[update.category] }}
      </span>
      <time class="date">{{ formattedDate }}</time>
    </div>

    <h3 class="title">{{ update.title }}</h3>
    
    <p v-if="update.excerpt" class="excerpt">{{ update.excerpt }}</p>

    <div class="card-footer">
      <span class="link-text">Leer más →</span>
    </div>
  </article>
</template>

<style scoped>
.update-card {
  /* Usa card-base de components.css */
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

/* badge-category y link-text ahora en components.css */

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
