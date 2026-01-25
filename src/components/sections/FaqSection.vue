<!--
Path: src/components/sections/FaqSection.vue
-->

<script setup lang="ts">
import { content } from '@/infrastructure/content';

const faqSection = content.home.faq;
</script>

<template>
  <section class="faq py-5" id="faq">
    <div class="container">
      <h2>{{ faqSection.title }}</h2>
      <div v-for="(item, idx) in faqSection.items" :key="idx" class="faq-item">
        <h3>{{ item.question }}</h3>
        <p>{{ item.answer }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* container en components.css */

.faq {
  background-color: #f9fafb;
}

.faq-item {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e0e0e0;
}

h3 {
  margin-bottom: 12px;
}

p {
  color: #555;
}
</style>
