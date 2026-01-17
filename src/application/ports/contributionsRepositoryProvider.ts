import type { ContributionsRepositoryPort } from './ContributionsRepository'

let contributionsRepository: ContributionsRepositoryPort | null = null

export function setContributionsRepository(repo: ContributionsRepositoryPort): void {
  contributionsRepository = repo
}

export function getContributionsRepository(): ContributionsRepositoryPort {
  if (!contributionsRepository) {
    throw new Error('ContributionsRepository not configured')
  }
  return contributionsRepository
}
