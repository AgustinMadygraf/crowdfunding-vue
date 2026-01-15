<!--
Path: src/components/sections/FaqSection.vue
-->

<script setup lang="ts">
import { faqSectionData } from '@/infrastructure/mockData';
</script>

<template>
  <section class="faq section-padding" id="faq">
    <div class="container-narrow">
      <h2>{{ faqSectionData.title }}</h2>
      <div v-for="(item, idx) in faqSectionData.items" :key="idx" class="faq-item">
        <h3>{{ item.question }}</h3>
        <p>{{ item.answer }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* section-padding y container-narrow en components.css */

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
