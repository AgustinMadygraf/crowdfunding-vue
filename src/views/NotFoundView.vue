<script setup lang="ts">
import { useRouter } from 'vue-router'
import { content } from '@/infrastructure/content'


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
  <div class="not-found-view">
    <div class="container">
      <h1 class="error-code">404</h1>
      <h2>{{ notFoundContent.title }}</h2>
      <p>{{ notFoundContent.subtitle }}</p>
      <button @click="goHome" class="home-button">{{ notFoundContent.cta }}</button>
    </div>
  </div>
</template>

<style scoped>
.not-found-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  text-align: center;
}

.container {
  max-width: 600px;
  padding: 3rem;
}

.error-code {
  font-size: 8rem;
  font-weight: bold;
  color: #42b983;
  margin: 0;
  line-height: 1;
}

h2 {
  font-size: 2rem;
  color: #2c3e50;
  margin: 1rem 0;
}

p {
  font-size: 1.25rem;
  color: #666;
  margin-bottom: 2rem;
}

.home-button {
  background: #42b983;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 4px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.home-button:hover {
  background: #359268;
}

@media (max-width: 768px) {
  .error-code {
    font-size: 5rem;
  }

  h2 {
    font-size: 1.5rem;
  }

  p {
    font-size: 1rem;
  }
}
</style>
