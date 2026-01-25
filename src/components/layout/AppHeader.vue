<!--
Path: src/components/layout/AppHeader.vue
-->

<script setup lang="ts">
import { content } from '@/infrastructure/content'

interface NavigationLink {
  label: string
  href: string
}

const props = defineProps<{
  links: NavigationLink[]
}>()

const headerContent = content.app.header

const isExternalOrHash = (href: string) => {
  return href.startsWith('#') || href.startsWith('http')
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
      <nav class="d-none d-md-block" :aria-label="headerContent.navAriaLabel">
        <ul class="list-unstyled d-flex gap-3 mb-0">
          <li v-for="link in props.links" :key="link.href">
            <a v-if="isExternalOrHash(link.href)" :href="link.href" class="text-decoration-none text-dark fw-medium">{{ link.label }}</a>
            <router-link v-else :to="link.href" class="text-decoration-none text-dark fw-medium">{{ link.label }}</router-link>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>
