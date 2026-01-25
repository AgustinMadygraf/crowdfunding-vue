<!--
Path: src/App.vue
-->

<script setup lang="ts">
import { computed } from 'vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import { useAuthStore } from '@/stores/authStore'
import { useCsrfToken } from '@/application/composables/useCsrfToken'
import { content } from '@/infrastructure/content'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)

// Inicializar token CSRF al montar la aplicación
useCsrfToken()

const navigationLinks = computed(() => {
  const baseLinks = [...content.app.navigation.links]

  if (isAuthenticated.value) {
    baseLinks.push(content.app.navigation.authLink)
  }

  return baseLinks
})
</script>

<template>
  <div class="d-flex flex-column min-vh-100 bg-white text-dark">
    <AppHeader :links="navigationLinks" :key="isAuthenticated ? 'auth' : 'guest'" />
    <main class="d-flex flex-column flex-grow-1">
      <RouterView :key="isAuthenticated ? 'auth' : 'guest'" />
    </main>
    <AppFooter />
  </div>
</template>
