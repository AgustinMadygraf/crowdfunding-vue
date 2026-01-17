import type { ContributionsRepositoryPort, UserContribution } from '@/application/ports/ContributionsRepository'

export class GetContributionByTokenUseCase {
  constructor(private readonly repo: ContributionsRepositoryPort) {}

  async execute(token: string): Promise<UserContribution> {
    if (!token?.trim()) {
      throw new Error('Token de contribucion invalido o vacio')
    }
    return this.repo.getByToken(token)
  }
}
