<script setup lang="ts">
interface NavigationLink {
  label: string;
  href: string;
}

const props = defineProps<{
  links: NavigationLink[];
}>();
</script>

<template>
  <header class="app-header">
    <div class="container">
      <div class="logo-container">
        <img alt="Madygraf logo" class="logo" src="@/assets/logo.svg" width="125" />
      </div>
      <nav class="main-nav" aria-label="Principal">
        <ul>
          <li v-for="link in props.links" :key="link.href">
            <a :href="link.href">{{ link.label }}</a>
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

.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
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
