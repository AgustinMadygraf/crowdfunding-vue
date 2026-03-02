<!--
Path: src/components/layout/AppHeader.vue
-->

<script setup lang="ts">
import { content } from '@/presentation/content'

interface NavigationLink {
  label: string
  href: string
}

const props = defineProps<{
  links: NavigationLink[]
}>()

const headerContent = content.app.header

const isExternalOrHash = (href: string) => {
  return href.charAt(0) === '#' || href.indexOf('http') === 0
}
</script>

<template>
  <header class="bg-white shadow-sm sticky-top py-3">
    <div class="container d-flex justify-content-between align-items-center">
      <div class="logo-container">
        <router-link to="/">
          <img :alt="headerContent.logoAlt" class="logo" src="@/assets/logo.svg" width="125" />
        </router-link>
      </div>
      <div class="d-flex align-items-center gap-3">
        <span class="deploy-badge">Prueba deploy 2026-03-02</span>
        <nav class="d-none d-md-block" :aria-label="headerContent.navAriaLabel">
          <ul class="list-unstyled d-flex gap-3 mb-0">
            <li v-for="link in props.links" :key="link.href">
              <a v-if="isExternalOrHash(link.href)" :href="link.href" class="text-decoration-none text-dark fw-medium">{{ link.label }}</a>
              <router-link v-else :to="link.href" class="text-decoration-none text-dark fw-medium">{{ link.label }}</router-link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </header>
</template>

<style scoped>
.deploy-badge {
  font-size: 0.75rem;
  font-weight: 600;
  color: #0b5137;
  background-color: #e9f7ef;
  border: 1px solid #b7e4c7;
  border-radius: 999px;
  padding: 0.25rem 0.6rem;
  white-space: nowrap;
}
</style>
