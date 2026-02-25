import { computed, ref } from 'vue'
import type { ContributionLevel } from '@/domain/contribution-level'
import { content } from '@/presentation/content'

export function useContributionLevels() {
  const levels = ref<ContributionLevel[]>([...content.data.contributionLevels])
  const selectedLevel = ref<ContributionLevel>(levels.value[0])

  const benefitAmount = computed(() =>
    Math.round((selectedLevel.value.amount * selectedLevel.value.benefit) / 100)
  )

  const selectLevel = (level: ContributionLevel) => {
    selectedLevel.value = level
  }

  return {
    levels,
    selectedLevel,
    selectLevel,
    benefitAmount
  }
}
