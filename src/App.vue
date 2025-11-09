<script setup lang="ts">
import AppFooter from '@/components/layout/AppFooter.vue';
import AppHeader from '@/components/layout/AppHeader.vue';
import ContributionSection from '@/components/sections/ContributionSection.vue';
import FaqSection from '@/components/sections/FaqSection.vue';
import HeroSection from '@/components/sections/HeroSection.vue';
import MilestonesSection from '@/components/sections/MilestonesSection.vue';
import UpdatesSection from '@/components/sections/UpdatesSection.vue';
import { useContributionLevels } from '@/application/useContributionLevels';
import { useMilestones } from '@/application/useMilestones';

const navigationLinks = [
  { label: 'Proyecto', href: '#about' },
  { label: 'Hitos', href: '#milestones' },
  { label: 'Aportar', href: '#contribute' },
  { label: 'Actualizaciones', href: '#updates' },
  { label: 'FAQ', href: '#faq' },
];

const { milestones, totalTargetAmount, totalRaisedAmount, progressPercentage } = useMilestones();
const { levels, selectedLevel, selectLevel, benefitAmount } = useContributionLevels();

const startContribution = () => {
  console.log('Starting contribution process with level:', selectedLevel.value);
};
</script>

<template>
  <div class="app-shell">
    <AppHeader :links="navigationLinks" />
    <main>
      <HeroSection
        title="Financiemos juntos la nueva capacidad productiva de Madygraf"
        subtitle="Tu aporte acelera la RKH‑A190. Seguís cada hito, ves el avance, recibís tu beneficio."
        primary-label="Quiero aportar"
        secondary-label="Ver avance"
        secondary-href="#milestones"
        @start="startContribution"
      />

      <MilestonesSection
        :milestones="milestones"
        :progress-percentage="progressPercentage"
        :total-raised-amount="totalRaisedAmount"
        :total-target-amount="totalTargetAmount"
      />

      <ContributionSection
        :levels="levels"
        :selected-level="selectedLevel"
        :benefit-amount="benefitAmount"
        @select="selectLevel"
        @start="startContribution"
      />

      <UpdatesSection />
      <FaqSection />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #ffffff;
  color: #333;
}

main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0;
}
</style>
