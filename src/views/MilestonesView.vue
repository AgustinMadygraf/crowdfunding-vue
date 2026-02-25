<!--
Path: src/views/MilestonesView.vue
-->

<script setup lang="ts">
import { useMilestones } from '@/presentation/composables/useMilestones'
import MilestoneCard from '@/components/milestones/MilestoneCard.vue'
import { content } from '@/presentation/content'


const { milestones, totalTargetAmount, totalRaisedAmount, progressPercentage } = useMilestones()
const milestonesViewContent = content.milestonesView

const fetchMilestones = async () => {
  try {
    // ...existing code...
  } catch (error) {
    console.error('Error obteniendo milestones (vista)', error)
    // ...existing code...
  }
}
</script>

<template>
  <div class="d-flex flex-column">
    <section class="py-5 text-center text-white" style="background: linear-gradient(135deg, #42b983 0%, #2c3e50 100%);">
      <div class="container">
        <h1 class="display-5 fw-bold mb-3">{{ milestonesViewContent.heroTitle }}</h1>
        <p class="lead mb-0">
          {{ milestonesViewContent.heroSubtitle }}
          <strong>${{ totalRaisedAmount.toLocaleString() }}</strong> {{ milestonesViewContent.heroAmountSeparator }}
          <strong>${{ totalTargetAmount.toLocaleString() }}</strong> ({{ progressPercentage }}%)
        </p>
      </div>
    </section>

    <section class="py-5 bg-light">
      <div class="container">
        <div class="row g-4">
          <div v-for="milestone in milestones" :key="milestone.id" class="col-12 col-md-6 col-lg-4">
            <MilestoneCard :milestone="milestone" />
          </div>
        </div>
      </div>
    </section>

    <section class="py-5 text-center">
      <div class="container">
        <h2 class="h3 mb-3">{{ milestonesViewContent.evidencesTitle }}</h2>
        <p class="text-muted mb-0">
          {{ milestonesViewContent.evidencesSubtitle }}
        </p>
      </div>
    </section>
  </div>
</template>
