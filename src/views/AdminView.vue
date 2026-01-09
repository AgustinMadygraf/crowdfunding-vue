<script setup lang="ts">
// TODO: Implement authentication check
// TODO: Implement admin services (milestones, evidences, updates, subscriptions)

const stats = {
  totalSubscriptions: 0,
  totalRaised: 30000,
  activeMilestones: 4,
  pendingEvidences: 0
}
</script>

<template>
  <div class="admin-view">
    <header class="admin-header">
      <div class="container">
        <h1>Panel de Administración</h1>
        <button class="logout-button">Cerrar sesión</button>
      </div>
    </header>

    <main class="admin-main">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-card">
            <h3>Suscripciones</h3>
            <p class="stat-value">{{ stats.totalSubscriptions }}</p>
          </div>
          <div class="stat-card">
            <h3>Monto recaudado</h3>
            <p class="stat-value">${{ stats.totalRaised.toLocaleString() }}</p>
          </div>
          <div class="stat-card">
            <h3>Etapas activas</h3>
            <p class="stat-value">{{ stats.activeMilestones }}</p>
          </div>
          <div class="stat-card">
            <h3>Evidencias pendientes</h3>
            <p class="stat-value">{{ stats.pendingEvidences }}</p>
          </div>
        </div>

        <div class="admin-sections">
          <section class="admin-section">
            <h2>Gestión de Etapas</h2>
            <p class="coming-soon">Próximamente: CRUD de etapas (milestones)</p>
          </section>

          <section class="admin-section">
            <h2>Gestión de Evidencias</h2>
            <p class="coming-soon">
              Próximamente: Subir y versionar evidencias con checksum SHA-256
            </p>
          </section>

          <section class="admin-section">
            <h2>Gestión de Actualizaciones</h2>
            <p class="coming-soon">Próximamente: Crear y publicar posts de actualización</p>
          </section>

          <section class="admin-section">
            <h2>Gestión de Suscripciones</h2>
            <p class="coming-soon">
              Próximamente: Ver, filtrar y exportar leads/suscripciones
            </p>
          </section>

          <section class="admin-section">
            <h2>Auditoría</h2>
            <p class="coming-soon">Próximamente: Log de eventos y cambios administrativos</p>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.admin-view {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.admin-header {
  background: #2c3e50;
  color: white;
  padding: 1.5rem 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.admin-header .container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.admin-header h1 {
  font-size: 1.5rem;
  margin: 0;
}

.logout-button {
  background: #42b983;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.logout-button:hover {
  background: #359268;
}

.admin-main {
  padding: 3rem 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.stat-card h3 {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
  margin: 0;
}

.admin-sections {
  display: grid;
  gap: 1.5rem;
}

.admin-section {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.admin-section h2 {
  font-size: 1.25rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.coming-soon {
  color: #999;
  font-style: italic;
}

@media (max-width: 768px) {
  .admin-header .container {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
