<!--
Path: src/components/sections/FaqSection.vue
-->

<script setup lang="ts">
import { content } from '@/infrastructure/content';

const faqSection = content.home.faq;
</script>

<template>
  <section class="bg-light py-5" id="faq">
    <div class="container">
      <h2 class="mb-4">{{ faqSection.title }}</h2>
      <div v-for="(item, idx) in faqSection.items" :key="idx" class="mb-4 pb-4 border-bottom">
        <h3 class="h5 mb-2">{{ item.question }}</h3>
        <p class="text-muted mb-0">{{ item.answer }}</p>
      </div>
    </div>
  </section>
</template>
