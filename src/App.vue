<script setup lang="ts">
import { computed } from 'vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import { authService } from '@/infrastructure/services/authService'

const isAuthenticated = computed(() => authService.isAuthenticated())

const navigationLinks = computed(() => {
  const baseLinks = [
    { label: 'Inicio', href: '/' },
    { label: 'Etapas', href: '/etapas' },
    { label: 'Actualizaciones', href: '/actualizaciones' },
    { label: 'Documentos', href: '/documentos' },
    { label: 'Suscribir', href: '/suscribir' }
  ]

  if (isAuthenticated.value) {
    baseLinks.push({ label: 'Mi Dashboard', href: '/account' })
  }

  return baseLinks
})
</script>

<template>
  <div class="app-shell">
    <AppHeader :links="navigationLinks" :key="isAuthenticated ? 'auth' : 'guest'" />
    <main>
      <RouterView :key="isAuthenticated ? 'auth' : 'guest'" />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #ffffff;
  color: #333;
}

main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0;
}
</style>
