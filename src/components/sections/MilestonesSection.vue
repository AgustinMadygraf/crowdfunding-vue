<!--
Path: src/components/sections/MilestonesSection.vue
-->

<script setup lang="ts">
import { ref } from 'vue';
import type { Milestone } from '@/domain/milestone';
import MilestoneCard from '@/components/milestones/MilestoneCard.vue';
import MilestoneDetailModal from '@/components/milestones/MilestoneDetailModal.vue';
import { content } from '@/presentation/content';

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
  <section class="bg-light py-5" id="milestones">
    <div class="container">
      <header class="d-flex justify-content-between align-items-start gap-4 flex-column flex-lg-row">
        <div>
          <h2 class="mb-2">{{ milestonesContent.title }}</h2>
          <p class="text-muted mb-0">{{ milestonesContent.subtitle }}</p>
        </div>
        <div class="card shadow-sm p-3 w-100 w-lg-auto" aria-live="polite">
          <p class="mb-1"><strong>{{ milestonesContent.summaryLabels.progress }}</strong> {{ props.progressPercentage }}%</p>
          <p class="mb-1"><strong>{{ milestonesContent.summaryLabels.raised }}</strong> {{ content.app.currencyLabel }} {{ props.totalRaisedAmount.toLocaleString() }}</p>
          <p class="mb-0"><strong>{{ milestonesContent.summaryLabels.target }}</strong> {{ content.app.currencyLabel }} {{ props.totalTargetAmount.toLocaleString() }}</p>
        </div>
      </header>

      <div class="row g-4 mt-4">
        <div
          v-for="milestone in props.milestones"
          :key="milestone.id"
          class="col-12 col-md-6 col-lg-4"
        >
          <MilestoneCard
            :milestone="milestone"
            @show-details="handleShowDetails"
          />
        </div>
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
