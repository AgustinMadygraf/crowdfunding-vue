import type { ContributionsRepositoryPort, UserContribution } from '@/application/ports/ContributionsRepository'

export class ListUserContributionsUseCase {
  constructor(private readonly repo: ContributionsRepositoryPort) {}

  async execute(userId: string): Promise<UserContribution[]> {
    if (!userId?.trim()) {
      throw new Error('UserId invalido o vacio')
    }
    return this.repo.getByUserId(userId)
  }
}
