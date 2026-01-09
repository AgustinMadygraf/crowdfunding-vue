<script setup lang="ts">
import HeroSection from '@/components/sections/HeroSection.vue'
import MilestonesSection from '@/components/sections/MilestonesSection.vue'
import ContributionSection from '@/components/sections/ContributionSection.vue'
import UpdatesSection from '@/components/sections/UpdatesSection.vue'
import FaqSection from '@/components/sections/FaqSection.vue'
import { useContributionLevels } from '@/application/useContributionLevels'
import { useMilestones } from '@/application/useMilestones'
import { useRouter } from 'vue-router'

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
      title="Financiemos juntxs la nueva capacidad productiva de Madygraf"
      subtitle="Tu aporte acelera la RKHA190. Seguís cada hito, ves el avance, recibís tu beneficio."
      primary-label="Quiero aportar"
      secondary-label="Ver avance"
      secondary-href="#milestones"
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
