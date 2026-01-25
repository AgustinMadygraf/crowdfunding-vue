<script setup lang="ts">
import { content } from '@/infrastructure/content';

const updatesContent = content.home.updatesSection;
</script>

<template>
  <section class="updates section-padding" id="updates">
    <div class="container-narrow">
      <h2>{{ updatesContent.title }}</h2>
      <p>{{ updatesContent.nextUpdateLabel }} {{ updatesContent.nextUpdateDate }}</p>
      <div class="updates-placeholder">
        <p>{{ updatesContent.placeholder }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* section-padding y container-narrow en components.css */

.updates-placeholder {
  margin-top: 24px;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  color: #555;
}
</style>
