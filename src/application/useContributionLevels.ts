import { computed, ref } from 'vue';
import type { ContributionLevel } from '@/domain/contribution-level';
import { mockContributionLevels } from '@/infrastructure/mockData';


export function useContributionLevels() {
  const levels = ref<ContributionLevel[]>([...mockContributionLevels]);
  const selectedLevel = ref<ContributionLevel>(levels.value[0]);

  const benefitAmount = computed(() =>
    Math.round((selectedLevel.value.amount * selectedLevel.value.benefit) / 100)
  );

  const selectLevel = (level: ContributionLevel) => {
    selectedLevel.value = level;
  };

  const fetchContributionLevels = async () => {
    try {
      // ...existing code...
    } catch (error) {
      console.error('Error fetching contribution levels', error)
      throw error
    }
  }

  return {
    levels,
    selectedLevel,
    selectLevel,
    benefitAmount,
  };
}
