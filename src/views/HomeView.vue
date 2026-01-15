<!-- 
 Path: src/views/HomeView.vue
 -->

<script setup lang="ts">
import HeroSection from '@/components/sections/HeroSection.vue'
import MilestonesSection from '@/components/sections/MilestonesSection.vue'
import ContributionSection from '@/components/sections/ContributionSection.vue'
import UpdatesSection from '@/components/sections/UpdatesSection.vue'
import FaqSection from '@/components/sections/FaqSection.vue'
import { useContributionLevels } from '@/application/useContributionLevels'
import { useMilestones } from '@/application/useMilestones'
import { useRouter } from 'vue-router'

import { homeViewHeroSection } from '@/infrastructure/mockData'

const router = useRouter()
const { milestones, totalTargetAmount, totalRaisedAmount, progressPercentage } = useMilestones()
const { levels, selectedLevel, selectLevel, benefitAmount } = useContributionLevels()

const startContribution = () => {
  router.push({ name: 'subscribe' })
}
</script>

<template>
  <div class="home-view">
    <HeroSection
      :title="homeViewHeroSection.title"
      :subtitle="homeViewHeroSection.subtitle"
      :primary-label="homeViewHeroSection.primaryLabel"
      :secondary-label="homeViewHeroSection.secondaryLabel"
      :secondary-href="homeViewHeroSection.secondaryHref"
      @start="startContribution"
    />

    <MilestonesSection
      id="milestones"
      :milestones="milestones"
      :progress-percentage="progressPercentage"
      :total-raised-amount="totalRaisedAmount"
      :total-target-amount="totalTargetAmount"
    />

    <ContributionSection
      id="contribute"
      :levels="levels"
      :selected-level="selectedLevel"
      :benefit-amount="benefitAmount"
      @select="selectLevel"
      @start="startContribution"
    />

    <UpdatesSection id="updates" />
    <FaqSection id="faq" />
  </div>
</template>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  gap: 0;
}
</style>
