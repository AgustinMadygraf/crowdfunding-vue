<script setup lang="ts">
// TODO: Implement documents service when backend is ready
const documentCategories = [
  {
    id: 1,
    name: 'Legal',
    description: 'Contratos, acuerdos y documentación legal',
    count: 0
  },
  {
    id: 2,
    name: 'Técnico',
    description: 'Especificaciones técnicas y manuales',
    count: 0
  },
  {
    id: 3,
    name: 'Comercial',
    description: 'Propuestas comerciales y facturación',
    count: 0
  },
  {
    id: 4,
    name: 'Logística',
    description: 'Documentación de transporte y aduanas',
    count: 0
  }
]
</script>

<template>
  <div class="documents-view">
    <section class="hero-section">
      <div class="container">
        <h1>Repositorio de Documentos</h1>
        <p class="subtitle">Acceso público a toda la documentación del proyecto</p>
      </div>
    </section>

    <section class="documents-section">
      <div class="container">
        <div class="categories-grid">
          <div
            v-for="category in documentCategories"
            :key="category.id"
            class="category-card"
          >
            <h3>{{ category.name }}</h3>
            <p>{{ category.description }}</p>
            <div class="count">
              <span v-if="category.count === 0">Sin documentos aún</span>
              <span v-else>{{ category.count }} documentos</span>
            </div>
          </div>
        </div>

        <div class="coming-soon">
          <h2>Próximamente</h2>
          <ul>
            <li>Documentos con versionado y checksums SHA-256</li>
            <li>Historial de cambios por documento</li>
            <li>Búsqueda y filtros por categoría</li>
            <li>Descargas directas y verificación de integridad</li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.documents-view {
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

.documents-section {
  padding: 80px 20px;
  background-color: #ffffff;
}

.categories-grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  margin-bottom: 4rem;
}

.category-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.category-card h3 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.category-card p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.count {
  color: #999;
  font-size: 0.875rem;
  font-style: italic;
}

.coming-soon {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 3rem;
  text-align: center;
}

.coming-soon h2 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.coming-soon ul {
  list-style: none;
  padding: 0;
  text-align: left;
  max-width: 600px;
  margin: 0 auto;
}

.coming-soon li {
  padding: 0.75rem 0;
  border-bottom: 1px solid #e0e0e0;
  color: #666;
}

.coming-soon li:last-child {
  border-bottom: none;
}

.coming-soon li::before {
  content: '✓';
  color: #42b983;
  font-weight: bold;
  margin-right: 0.75rem;
}

@media (max-width: 768px) {
  .hero-section h1 {
    font-size: 2rem;
  }

  .categories-grid {
    grid-template-columns: 1fr;
  }

  .coming-soon ul {
    text-align: center;
  }
}
</style>
