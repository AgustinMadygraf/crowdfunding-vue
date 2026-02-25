import type {
  ContributionsRepositoryPort,
  CreateContributionInput
} from '@/application/ports/ContributionsRepository'

export class CreateContributionUseCase {
  constructor(private readonly repo: ContributionsRepositoryPort) {}

  async execute(data: CreateContributionInput): Promise<string> {
    const result = await this.repo.create({
      ...data,
      utm_params: data.utm_params || {}
    })
    return result.token
  }
}
