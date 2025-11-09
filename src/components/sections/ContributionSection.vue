<script setup lang="ts">
import type { ContributionLevel } from '@/domain/contribution-level';

const props = defineProps<{
  levels: ContributionLevel[];
  selectedLevel: ContributionLevel;
  benefitAmount: number;
}>();

const emit = defineEmits<{
  (event: 'select', level: ContributionLevel): void;
  (event: 'start'): void;
}>();

const formatCurrency = (value: number) => `ARS ${value.toLocaleString()}`;
</script>

<template>
  <section class="contribute" id="contribute">
    <div class="container">
      <h2>Seleccioná tu nivel de aporte</h2>
      <p>Bono fijo con beneficio en especie, transferible y con validez de 12 meses.</p>

      <div class="contribution-levels">
        <article
          v-for="level in props.levels"
          :key="level.amount"
          :class="['level-card', { selected: level.amount === props.selectedLevel.amount }]"
          @click="emit('select', level)"
        >
          <h3>{{ level.name }}</h3>
          <p class="amount">{{ formatCurrency(level.amount) }}</p>
          <p class="benefit">+{{ level.benefit }}% crédito de compra</p>
        </article>
      </div>

      <aside class="selected-level-info" aria-live="polite">
        <h3>Tu selección</h3>
        <p>
          Aporte: <strong>{{ formatCurrency(props.selectedLevel.amount) }}</strong>
        </p>
        <p>
          Beneficio: <strong>+{{ props.selectedLevel.benefit }}% ({{ formatCurrency(props.benefitAmount) }})</strong>
        </p>
        <button class="btn btn-primary btn-lg" type="button" @click="emit('start')">Continuar</button>
      </aside>

      <p class="disclaimer">
        Este programa constituye un crowdfunding productivo con beneficio en especie. No representa oferta pública de
        valores ni asesoramiento financiero. El beneficio es un crédito de compra con vigencia y condiciones publicadas.
      </p>
    </div>
  </section>
</template>

<style scoped>
.contribute {
  padding: 80px 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.contribution-levels {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  margin: 40px 0;
}

.level-card {
  background-color: #fff;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.level-card:hover {
  border-color: #4caf50;
  transform: translateY(-4px);
}

.level-card.selected {
  border-color: #4caf50;
  background-color: rgba(76, 175, 80, 0.1);
}

.amount {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 16px 0;
}

.benefit {
  color: #4caf50;
  font-weight: 600;
}

.selected-level-info {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 24px;
  margin: 30px 0;
  text-align: center;
}

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
  background-color: #4caf50;
  color: white;
}

.btn-primary:hover {
  background-color: #45a049;
}

.btn-lg {
  padding: 15px 30px;
  font-size: 1.1rem;
}

.disclaimer {
  background-color: #f0f0f0;
  border-radius: 4px;
  padding: 16px;
  font-size: 0.9rem;
  color: #555;
}
</style>
