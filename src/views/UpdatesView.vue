<script setup lang="ts">
// TODO: Implement updates service when backend is ready
const updates = [
  {
    id: 1,
    category: 'Comercial',
    title: 'Inicio del Proyecto Madypack',
    date: '2025-09-21',
    content: 'Damos inicio al proceso de financiamiento colaborativo para la adquisición de la rotativa RKHA190.'
  }
]
</script>

<template>
  <div class="updates-view">
    <section class="hero-section">
      <div class="container">
        <h1>Actualizaciones del Proyecto</h1>
        <p class="subtitle">Mantente informado sobre el progreso y novedades</p>
      </div>
    </section>

    <section class="updates-section">
      <div class="container">
        <div class="updates-list">
          <article v-for="update in updates" :key="update.id" class="update-card">
            <div class="update-header">
              <span class="category">{{ update.category }}</span>
              <span class="date">{{ new Date(update.date).toLocaleDateString('es-AR') }}</span>
            </div>
            <h2 class="update-title">{{ update.title }}</h2>
            <p class="update-content">{{ update.content }}</p>
          </article>

          <div class="coming-soon">
            <p>Próxima actualización: 21 septiembre 2025</p>
            <p class="note">
              Recibirás notificaciones por email si te suscribís al proyecto
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.updates-view {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.hero-section {
  padding: 80px 20px 40px;
  background: linear-gradient(135deg, #42b983 0%, #2c3e50 100%);
  color: white;
  text-align: center;
}

.container {
  max-width: 960px;
  margin: 0 auto;
}

.hero-section h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
}

.updates-section {
  padding: 80px 20px;
  background-color: #ffffff;
}

.updates-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.update-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.update-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.category {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #42b983;
  color: white;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 600;
}

.date {
  color: #666;
  font-size: 0.875rem;
}

.update-title {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.update-content {
  color: #555;
  line-height: 1.6;
}

.coming-soon {
  text-align: center;
  padding: 3rem 2rem;
  background: #f5f5f5;
  border-radius: 8px;
  margin-top: 2rem;
}

.coming-soon p {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.note {
  font-size: 0.9rem;
  color: #999;
}

@media (max-width: 768px) {
  .hero-section h1 {
    font-size: 2rem;
  }

  .update-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .update-title {
    font-size: 1.25rem;
  }
}
</style>
