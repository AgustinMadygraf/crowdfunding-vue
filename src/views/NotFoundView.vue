<!--
Path: src/views/NotFoundView.vue
-->

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { content } from '@/presentation/content'


const router = useRouter()
const notFoundContent = content.notFoundView

const goHome = () => {
  router.push('/')
}

const handleNotFound = () => {
  try {
    // ...existing code...
  } catch (error) {
    console.error('Error en NotFoundView', error)
    // ...existing code...
  }
}
</script>

<template>
  <div class="d-flex align-items-center justify-content-center min-vh-80 text-center bg-light bg-gradient py-5">
    <div class="container" style="max-width: 600px;">
      <h1 class="display-1 fw-bold text-success mb-0">404</h1>
      <h2 class="h2 my-3">{{ notFoundContent.title }}</h2>
      <p class="lead text-muted mb-4">{{ notFoundContent.subtitle }}</p>
      <button @click="goHome" class="btn btn-primary btn-lg">{{ notFoundContent.cta }}</button>
    </div>
  </div>
</template>
