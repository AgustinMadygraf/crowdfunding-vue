<!--
Path: src/views/MilestonesView.vue
-->

<script setup lang="ts">
import { useMilestones } from '@/application/useMilestones'
import MilestoneCard from '@/components/milestones/MilestoneCard.vue'
import { content } from '@/infrastructure/content'


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
  <div class="milestones-view">
    <section class="hero-section">
      <div class="container">
        <h1>{{ milestonesViewContent.heroTitle }}</h1>
        <p class="subtitle">
          {{ milestonesViewContent.heroSubtitle }}
          <strong>${{ totalRaisedAmount.toLocaleString() }}</strong> {{ milestonesViewContent.heroAmountSeparator }}
          <strong>${{ totalTargetAmount.toLocaleString() }}</strong> ({{ progressPercentage }}%)
        </p>
      </div>
    </section>

    <section class="milestones-section">
      <div class="container">
        <div class="milestones-grid">
          <MilestoneCard
            v-for="milestone in milestones"
            :key="milestone.id"
            :milestone="milestone"
          />
        </div>
      </div>
    </section>

    <section class="evidences-section">
      <div class="container">
        <h2>{{ milestonesViewContent.evidencesTitle }}</h2>
        <p class="coming-soon">
          {{ milestonesViewContent.evidencesSubtitle }}
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.milestones-view {
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

.milestones-section {
  padding: 80px 20px;
  background-color: #f5f5f5;
}

.milestones-grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.evidences-section {
  padding: 80px 20px;
  text-align: center;
}

.evidences-section h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.coming-soon {
  font-size: 1.1rem;
  color: #666;
}

@media (max-width: 768px) {
  .hero-section h1 {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .milestones-grid {
    grid-template-columns: 1fr;
  }
}
</style>
