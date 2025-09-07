<script setup lang="ts">
// Basic reactive state for the application
import { ref } from 'vue';

// Mock data for development/testing
const milestones = ref([
  { id: 1, name: 'Anticipo', targetAmount: 100000, raisedAmount: 30000, targetDate: '2025-10-15', status: 'active' },
  { id: 2, name: 'Saldo embarque', targetAmount: 200000, raisedAmount: 0, targetDate: '2025-12-01', status: 'pending' },
  { id: 3, name: 'Flete y Aduana', targetAmount: 60000, raisedAmount: 0, targetDate: '2026-01-15', status: 'pending' },
  { id: 4, name: 'Montaje/PPM', targetAmount: 18000, raisedAmount: 0, targetDate: '2026-02-01', status: 'pending' },
]);

const contributionLevels = ref([
  { amount: 25000, benefit: 6, name: 'Colaborador' },
  { amount: 50000, benefit: 8, name: 'Aliado' },
  { amount: 100000, benefit: 10, name: 'Socio' },
  { amount: 250000, benefit: 12, name: 'Impulsor' },
  { amount: 500000, benefit: 14, name: 'Estratégico' },
  { amount: 1000000, benefit: 18, name: 'Principal' },
]);

const selectedLevel = ref(contributionLevels.value[0]);

// Placeholder functions that would be implemented in components
const selectLevel = (level: { amount: number; benefit: number; name: string; } | { amount: number; benefit: number; name: string; }) => {
  selectedLevel.value = level;
};

const startContribution = () => {
  console.log('Starting contribution process with level:', selectedLevel.value);
  // This would trigger the form and payment process in a real implementation
};
</script>

<template>
  <div class="crowdfunding-app">
    <!-- Header -->
    <header class="app-header">
      <div class="container">
        <div class="logo-container">
          <img alt="Madygraf logo" class="logo" src="./assets/logo.svg" width="125" />
        </div>
        <nav class="main-nav">
          <ul>
            <li><a href="#about">Proyecto</a></li>
            <li><a href="#milestones">Hitos</a></li>
            <li><a href="#contribute">Aportar</a></li>
            <li><a href="#updates">Actualizaciones</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
        </nav>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero" id="about">
      <div class="container">
        <h1>Financiemos juntos la nueva capacidad productiva de Madygraf</h1>
        <p class="hero-subtitle">
          Tu aporte acelera la RKH‑A190. Seguís cada hito, ves el avance, recibís tu beneficio.
        </p>
        <div class="cta-buttons">
          <button class="btn btn-primary" @click="startContribution">Quiero aportar</button>
          <a href="#milestones" class="btn btn-secondary">Ver avance</a>
        </div>
      </div>
    </section>

    <!-- Milestones Section -->
    <section class="milestones" id="milestones">
      <div class="container">
        <h2>Avance por hitos</h2>
        <p>Seguimiento transparente del proyecto en tiempo real.</p>
        
        <div class="milestones-grid">
          <div v-for="milestone in milestones" :key="milestone.id" class="milestone-card">
            <h3>{{ milestone.name }}</h3>
            <div class="progress-container">
              <div class="progress-bar" :style="{width: (milestone.raisedAmount / milestone.targetAmount * 100) + '%'}"></div>
            </div>
            <div class="milestone-details">
              <p><strong>Meta:</strong> ARS {{ milestone.targetAmount.toLocaleString() }}</p>
              <p><strong>Recaudado:</strong> ARS {{ milestone.raisedAmount.toLocaleString() }} ({{ Math.round(milestone.raisedAmount / milestone.targetAmount * 100) }}%)</p>
              <p><strong>Fecha objetivo:</strong> {{ new Date(milestone.targetDate).toLocaleDateString() }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contribution Section -->
    <section class="contribute" id="contribute">
      <div class="container">
        <h2>Seleccioná tu nivel de aporte</h2>
        <p>Bono fijo con beneficio en especie, transferible y con validez de 12 meses.</p>
        
        <div class="contribution-levels">
          <div 
            v-for="level in contributionLevels" 
            :key="level.amount" 
            class="level-card"
            :class="{ 'selected': level === selectedLevel }"
            @click="selectLevel(level)"
          >
            <h3>{{ level.name }}</h3>
            <div class="amount">ARS {{ level.amount.toLocaleString() }}</div>
            <div class="benefit">+{{ level.benefit }}% crédito de compra</div>
          </div>
        </div>
        
        <div class="selected-level-info">
          <h3>Tu selección</h3>
          <p>Aporte: <strong>ARS {{ selectedLevel.amount.toLocaleString() }}</strong></p>
          <p>Beneficio: <strong>+{{ selectedLevel.benefit }}% (ARS {{ Math.round(selectedLevel.amount * selectedLevel.benefit / 100).toLocaleString() }})</strong></p>
          <button class="btn btn-primary btn-lg" @click="startContribution">Continuar</button>
        </div>
        
        <div class="disclaimer">
          <p>Este programa constituye un crowdfunding productivo con beneficio en especie. No representa oferta pública de valores ni asesoramiento financiero. El beneficio es un crédito de compra con vigencia y condiciones publicadas.</p>
        </div>
      </div>
    </section>

    <!-- Updates Section Placeholder -->
    <section class="updates" id="updates">
      <div class="container">
        <h2>Actualizaciones quincenales</h2>
        <p>Próxima actualización: 21 de septiembre de 2025</p>
        
        <div class="updates-placeholder">
          <p>Aquí se mostrarán las actualizaciones quincenales del proyecto.</p>
        </div>
      </div>
    </section>

    <!-- FAQ Section Placeholder -->
    <section class="faq" id="faq">
      <div class="container">
        <h2>Preguntas frecuentes</h2>
        
        <div class="faq-item">
          <h3>¿Qué es un bono con beneficio en especie?</h3>
          <p>Es un instrumento que permite apoyar el proyecto recibiendo a cambio un crédito de compra aplicable a productos y servicios de Madygraf.</p>
        </div>
        
        <div class="faq-item">
          <h3>¿Cuál es la vigencia del beneficio?</h3>
          <p>El crédito de compra tiene una vigencia de 12 meses desde la confirmación del aporte.</p>
        </div>
        
        <div class="faq-item">
          <h3>¿Puedo transferir mi beneficio?</h3>
          <p>Sí, el crédito de compra es transferible a terceros.</p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="app-footer">
      <div class="container">
        <div class="footer-info">
          <div class="footer-logo">
            <img alt="Madygraf logo" src="./assets/logo.svg" width="80" />
            <p>Cooperativa de Trabajo Madygraf</p>
          </div>
          <div class="footer-links">
            <h4>Documentos</h4>
            <ul>
              <li><a href="#">Términos y Condiciones</a></li>
              <li><a href="#">Política de Privacidad</a></li>
              <li><a href="#">Contacto</a></li>
            </ul>
          </div>
          <div class="footer-contact">
            <h4>Contacto</h4>
            <p>Email: info@madypack.com.ar</p>
            <div class="social-links">
              <a href="#" aria-label="Instagram">IG</a>
              <a href="#" aria-label="LinkedIn">LI</a>
            </div>
          </div>
        </div>
        <div class="copyright">
          <p>&copy; 2025 Cooperativa de Trabajo Madygraf. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Basic Reset */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Global Styles */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

section {
  padding: 60px 0;
}

h1, h2, h3, h4 {
  margin-bottom: 20px;
}

/* Layout Styles */
.crowdfunding-app {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #333;
}

/* Header */
.app-header {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 15px 0;
}

.app-header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.main-nav ul {
  display: flex;
  list-style: none;
}

.main-nav ul li {
  margin-left: 20px;
}

.main-nav ul li a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
}

/* Hero Section */
.hero {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  text-align: center;
  padding: 100px 0;
}

.hero h1 {
  font-size: 2.5rem;
  max-width: 800px;
  margin: 0 auto 20px;
}

.hero-subtitle {
  font-size: 1.2rem;
  max-width: 600px;
  margin: 0 auto 40px;
}

/* Buttons */
.btn {
  display: inline-block;
  padding: 12px 24px;
  border-radius: 4px;
  font-weight: bold;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-primary:hover {
  background-color: #45a049;
}

.btn-secondary {
  background-color: transparent;
  color: #333;
  border: 2px solid #333;
  margin-left: 15px;
}

.btn-secondary:hover {
  background-color: #333;
  color: white;
}

.btn-lg {
  padding: 15px 30px;
  font-size: 1.1rem;
}

/* Milestones */
.milestones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 40px;
}

.milestone-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  padding: 20px;
  transition: transform 0.3s ease;
}

.milestone-card:hover {
  transform: translateY(-5px);
}

.progress-container {
  width: 100%;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  margin: 15px 0;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #4CAF50;
  border-radius: 4px;
}

/* Contribution Levels */
.contribution-levels {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin: 40px 0;
}

.level-card {
  background-color: #fff;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.level-card:hover {
  border-color: #4CAF50;
  transform: translateY(-5px);
}

.level-card.selected {
  border-color: #4CAF50;
  background-color: rgba(76, 175, 80, 0.1);
}

.level-card .amount {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 10px 0;
}

.level-card .benefit {
  color: #4CAF50;
  font-weight: bold;
}

.selected-level-info {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  margin: 30px 0;
  text-align: center;
}

.disclaimer {
  background-color: #f0f0f0;
  border-radius: 4px;
  padding: 15px;
  margin-top: 30px;
  font-size: 0.9rem;
  color: #666;
}

/* FAQ */
.faq-item {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

/* Footer */
.app-footer {
  background-color: #333;
  color: white;
  padding: 60px 0 20px;
}

.footer-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
  margin-bottom: 40px;
}

.footer-links ul {
  list-style: none;
}

.footer-links ul li {
  margin-bottom: 10px;
}

.footer-links ul li a {
  color: #ddd;
  text-decoration: none;
}

.social-links {
  display: flex;
  gap: 15px;
  margin-top: 15px;
}

.social-links a {
  color: white;
  text-decoration: none;
}

.copyright {
  text-align: center;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid rgba(255,255,255,0.1);
  font-size: 0.9rem;
  color: #999;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .main-nav {
    display: none; /* In a real implementation you'd add a mobile menu */
  }
  
  .hero {
    padding: 60px 0;
  }
  
  .hero h1 {
    font-size: 2rem;
  }
  
  .contribution-levels, 
  .milestones-grid {
    grid-template-columns: 1fr;
  }
}
</style>
