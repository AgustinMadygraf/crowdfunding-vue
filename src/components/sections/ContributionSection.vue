<script setup lang="ts">
import type { ContributionLevel } from '@/domain/contribution-level';
import { content } from '@/infrastructure/content';

const props = defineProps<{
  levels: ContributionLevel[];
  selectedLevel: ContributionLevel;
  benefitAmount: number;
}>();

const emit = defineEmits<{
  (event: 'select', level: ContributionLevel): void;
  (event: 'start'): void;
}>();

const formatCurrency = (value: number) =>
  `${content.app.currencyLabel} ${value.toLocaleString()}`;
const contributionContent = content.home.contribution;
</script>

<template>
  <section class="contribute py-5" id="contribute">
    <div class="container">
      <h2>{{ contributionContent.title }}</h2>
      <p>{{ contributionContent.subtitle }}</p>

      <div class="contribution-levels">
        <article
          v-for="level in props.levels"
          :key="level.amount"
          :class="['card', 'shadow-sm', 'level-card', 'cursor-pointer', { selected: level.amount === props.selectedLevel.amount }]"
          @click="emit('select', level)"
          role="button"
          tabindex="0"
        >
          <h3>{{ level.name }}</h3>
          <p class="amount">{{ formatCurrency(level.amount) }}</p>
          <p class="benefit">
            {{ contributionContent.benefitLabel.replace('{benefit}', String(level.benefit)) }}
          </p>
        </article>
      </div>

      <aside class="selected-level-info" aria-live="polite">
        <h3>{{ contributionContent.selectionTitle }}</h3>
        <p>
          {{ contributionContent.selectionAmountLabel }}
          <strong>{{ formatCurrency(props.selectedLevel.amount) }}</strong>
        </p>
        <p>
          {{ contributionContent.selectionBenefitLabel }}
          <strong>
            +{{ props.selectedLevel.benefit }}% ({{ formatCurrency(props.benefitAmount) }})
          </strong>
        </p>
        <button class="btn btn-primary btn-lg" type="button" @click="emit('start')">
          {{ contributionContent.continueLabel }}
        </button>
      </aside>

      <p class="disclaimer">
        {{ contributionContent.disclaimer }}
      </p>
    </div>
  </section>
</template>

<style scoped>
/* container en Bootstrap */

.contribution-levels {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  margin: 40px 0;
}

/* card y shadow-sm en Bootstrap */
.level-card {
  text-align: center;
  border: 2px solid #e0e0e0;
}

.level-card:hover {
  border-color: var(--color-success);
}

.level-card.selected {
  border-color: var(--color-success);
  background-color: rgba(76, 175, 80, 0.1);
}

.amount {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 16px 0;
}

.benefit {
  color: var(--color-success);
  font-weight: 600;
}

.selected-level-info {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 24px;
  margin: 30px 0;
  text-align: center;
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
