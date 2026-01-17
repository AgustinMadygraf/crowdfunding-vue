import type { ContributionsRepositoryPort } from '@/application/ports/ContributionsRepository'
import type { CreateContributionData } from '@/application/useSubscription'

export class CreateContributionUseCase {
  constructor(private readonly repo: ContributionsRepositoryPort) {}

  async execute(data: CreateContributionData): Promise<string> {
    const result = await this.repo.create({
      ...data,
      utm_params: data.utm_params || {}
    })
    return result.token
  }
}
