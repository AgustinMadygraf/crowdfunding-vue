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
  <header class="app-header">
    <div class="container">
      <div class="logo-container">
        <router-link to="/">
          <img :alt="headerContent.logoAlt" class="logo" src="@/assets/logo.svg" width="125" />
        </router-link>
      </div>
      <nav class="main-nav" :aria-label="headerContent.navAriaLabel">
        <ul>
          <li v-for="link in props.links" :key="link.href">
            <a v-if="isExternalOrHash(link.href)" :href="link.href">{{ link.label }}</a>
            <router-link v-else :to="link.href">{{ link.label }}</router-link>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 15px 0;
}

/* container en components.css */
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.main-nav ul {
  display: flex;
  list-style: none;
  gap: 20px;
}

.main-nav a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
}

@media (max-width: 768px) {
  .main-nav {
    display: none;
  }
}
</style>
