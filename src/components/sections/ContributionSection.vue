<!--
Path: src/components/sections/ContributionSection.vue
-->

<script setup lang="ts">
import type { ContributionLevel } from '@/domain/contribution-level';
import { content } from '@/presentation/content';

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
  <section class="py-5" id="contribute">
    <div class="container">
      <h2 class="mb-2">{{ contributionContent.title }}</h2>
      <p class="text-muted mb-4">{{ contributionContent.subtitle }}</p>

      <div class="row g-3 my-4">
        <div
          v-for="level in props.levels"
          :key="level.amount"
          class="col-12 col-md-6 col-lg-4"
        >
          <article
            :class="['card', 'shadow-sm', 'cursor-pointer', { 'border-success border-2 bg-success-subtle': level.amount === props.selectedLevel.amount, 'border': level.amount !== props.selectedLevel.amount }]"
            @click="emit('select', level)"
            role="button"
            tabindex="0"
          >
            <div class="card-body text-center">
              <h3 class="h5 mb-2">{{ level.name }}</h3>
              <p class="fs-4 fw-bold my-3">{{ formatCurrency(level.amount) }}</p>
              <p class="text-success fw-semibold mb-0">
                {{ contributionContent.benefitLabel.replace('{benefit}', String(level.benefit)) }}
              </p>
            </div>
          </article>
        </div>
      </div>

      <aside class="card bg-light border-0 text-center my-4" aria-live="polite">
        <div class="card-body">
          <h3 class="h5 mb-3">{{ contributionContent.selectionTitle }}</h3>
          <p class="mb-2">
          {{ contributionContent.selectionAmountLabel }}
          <strong>{{ formatCurrency(props.selectedLevel.amount) }}</strong>
          </p>
          <p class="mb-3">
          {{ contributionContent.selectionBenefitLabel }}
          <strong>
            +{{ props.selectedLevel.benefit }}% ({{ formatCurrency(props.benefitAmount) }})
          </strong>
          </p>
          <button class="btn btn-primary btn-lg" type="button" @click="emit('start')">
          {{ contributionContent.continueLabel }}
          </button>
        </div>
      </aside>

      <p class="bg-light border rounded-2 p-3 small text-muted">
        {{ contributionContent.disclaimer }}
      </p>
    </div>
  </section>
</template>
