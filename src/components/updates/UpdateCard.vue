<script setup lang="ts">
import type { Update } from '@/domain/update';

const props = defineProps<{
  update: Update;
}>();

const categoryColors: Record<string, string> = {
  comercial: '#2196f3',
  tecnico: '#ff9800',
  logistica: '#9c27b0',
  legal: '#4caf50',
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
  <article class="update-card">
    <div class="update-header">
      <span 
        class="category-badge" 
        :style="{ backgroundColor: categoryColors[update.category] }"
      >
        {{ categoryLabels[update.category] }}
      </span>
      <time class="date">{{ formattedDate }}</time>
    </div>

    <h3 class="title">{{ update.title }}</h3>
    
    <p v-if="update.excerpt" class="excerpt">{{ update.excerpt }}</p>

    <div class="card-footer">
      <span class="read-more">Leer más →</span>
    </div>
  </article>
</template>

<style scoped>
.update-card {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 24px;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
  border-left: 4px solid transparent;
}

.update-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  border-left-color: var(--color-primary, #2196f3);
}

.update-card:focus-visible {
  outline: 2px solid #2196f3;
  outline-offset: 2px;
}

.update-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
}

.category-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: white;
}

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
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
}

.read-more {
  font-size: 14px;
  color: #2196f3;
  font-weight: 600;
  transition: color 0.2s;
}

.update-card:hover .read-more {
  color: #1976d2;
}

@media (max-width: 600px) {
  .update-card {
    padding: 20px;
  }

  .title {
    font-size: 18px;
  }

  .excerpt {
    font-size: 13px;
    -webkit-line-clamp: 2;
  }
}
</style>
