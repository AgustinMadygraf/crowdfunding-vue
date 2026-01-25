<!--
Path: src/components/sections/HeroSection.vue
-->

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
  <section class="bg-light bg-gradient text-center py-5" id="about">
    <div class="container">
      <h1 class="display-5 fw-bold mb-3">{{ props.title }}</h1>
      <p class="lead mx-auto mb-4 col-lg-8">{{ props.subtitle }}</p>
      <div class="d-flex justify-content-center gap-3 flex-column flex-md-row">
        <button class="btn btn-primary" type="button" @click="emit('start')">{{ props.primaryLabel }}</button>
        <a :href="props.secondaryHref" class="btn btn-secondary">{{ props.secondaryLabel }}</a>
      </div>
    </div>
  </section>
</template>
