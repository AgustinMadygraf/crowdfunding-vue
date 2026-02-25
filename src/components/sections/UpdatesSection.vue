<!--
Path: src/components/sections/UpdatesSection.vue
-->

<script setup lang="ts">
import { content } from '@/presentation/content';

const updatesContent = content.home.updatesSection;
</script>

<template>
  <section class="updates py-5" id="updates">
    <div class="container">
      <h2>{{ updatesContent.title }}</h2>
      <p>{{ updatesContent.nextUpdateLabel }} {{ updatesContent.nextUpdateDate }}</p>
      <div class="bg-light rounded-3 p-4 text-center text-muted mt-4">
        <p class="mb-0">{{ updatesContent.placeholder }}</p>
      </div>
    </div>
  </section>
</template>
