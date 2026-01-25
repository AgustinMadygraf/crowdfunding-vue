<script setup lang="ts">
const props = defineProps<{
  title: string;
  subtitle: string;
  primaryLabel: string;
  secondaryLabel: string;
  secondaryHref: string;
}>();

const emit = defineEmits<{ (event: 'start'): void }>();
</script>

<template>
  <section class="hero" id="about">
    <div class="container">
      <h1>{{ props.title }}</h1>
      <p class="hero-subtitle">{{ props.subtitle }}</p>
      <div class="cta-buttons">
        <button class="btn btn-primary" type="button" @click="emit('start')">{{ props.primaryLabel }}</button>
        <a :href="props.secondaryHref" class="btn btn-secondary">{{ props.secondaryLabel }}</a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  text-align: center;
  padding: 100px 20px;
}

/* container en components.css */

h1 {
  font-size: 2.75rem;
  margin-bottom: 20px;
}

.hero-subtitle {
  font-size: 1.2rem;
  margin: 0 auto 40px;
  max-width: 620px;
}

.cta-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
}

@media (max-width: 768px) {
  .hero {
    padding: 60px 20px;
  }

  h1 {
    font-size: 2rem;
  }

  .cta-buttons {
    flex-direction: column;
  }
}
</style>
