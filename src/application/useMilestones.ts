import { computed, ref } from 'vue';
import type { Milestone } from '@/domain/milestone';
import { mockMilestones } from '@/infrastructure/mockData';

export function useMilestones() {
  const milestones = ref<Milestone[]>([...mockMilestones]);

  const totalTargetAmount = computed(() =>
    milestones.value.reduce((total, milestone) => total + milestone.targetAmount, 0)
  );

  const totalRaisedAmount = computed(() =>
    milestones.value.reduce((total, milestone) => total + milestone.raisedAmount, 0)
  );

  const progressPercentage = computed(() => {
    if (totalTargetAmount.value === 0) {
      return 0;
    }
    return Math.min(Math.round((totalRaisedAmount.value / totalTargetAmount.value) * 100), 100);
  });

  return {
    milestones,
    totalTargetAmount,
    totalRaisedAmount,
    progressPercentage,
  };
}
