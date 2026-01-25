<!--
Path: src/components/sections/MilestonesSection.vue
-->

<script setup lang="ts">
import { ref } from 'vue';
import type { Milestone } from '@/domain/milestone';
import MilestoneCard from '@/components/milestones/MilestoneCard.vue';
import MilestoneDetailModal from '@/components/milestones/MilestoneDetailModal.vue';
import { content } from '@/infrastructure/content';

const props = defineProps<{
  milestones: Milestone[];
  totalTargetAmount: number;
  totalRaisedAmount: number;
  progressPercentage: number;
}>();

const selectedMilestone = ref<Milestone | null>(null);
const showModal = ref(false);

const handleShowDetails = (milestone: Milestone) => {
  selectedMilestone.value = milestone;
  showModal.value = true;
};

const handleCloseModal = () => {
  showModal.value = false;
  selectedMilestone.value = null;
};

const milestonesContent = content.home.milestonesSection;
</script>

<template>
  <section class="milestones py-5" id="milestones">
    <div class="container">
      <header class="section-header">
        <div>
          <h2>{{ milestonesContent.title }}</h2>
          <p>{{ milestonesContent.subtitle }}</p>
        </div>
        <div class="card shadow-sm p-3 summary" aria-live="polite">
          <p><strong>{{ milestonesContent.summaryLabels.progress }}</strong> {{ props.progressPercentage }}%</p>
          <p><strong>{{ milestonesContent.summaryLabels.raised }}</strong> {{ content.app.currencyLabel }} {{ props.totalRaisedAmount.toLocaleString() }}</p>
          <p><strong>{{ milestonesContent.summaryLabels.target }}</strong> {{ content.app.currencyLabel }} {{ props.totalTargetAmount.toLocaleString() }}</p>
        </div>
      </header>

      <div class="milestones-grid">
        <MilestoneCard
          v-for="milestone in props.milestones"
          :key="milestone.id"
          :milestone="milestone"
          @show-details="handleShowDetails"
        />
      </div>
    </div>

    <!-- Modal de detalles -->
    <MilestoneDetailModal
      v-if="selectedMilestone"
      :milestone="selectedMilestone"
      :is-open="showModal"
      @close="handleCloseModal"
    />
  </section>
</template>

<style scoped>
/* container en Bootstrap */

.milestones {
  background: #f9fafb;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.section-header h2 {
  margin-bottom: 12px;
}

/* card en Bootstrap */
.summary {
  display: grid;
  gap: 8px;
  min-width: 260px;
}

.milestones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-top: 40px;
}

@media (max-width: 900px) {
  .section-header {
    flex-direction: column;
  }

  .summary {
    width: 100%;
    min-width: unset;
  }
}
</style>
