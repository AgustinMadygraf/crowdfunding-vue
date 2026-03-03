import type {
  DocumentsReadRepositoryPort,
  MilestonesReadRepositoryPort,
  UpdatesReadRepositoryPort
} from '@/application/ports/PublicDataRepositories'

let milestonesRepository: MilestonesReadRepositoryPort | null = null
let updatesRepository: UpdatesReadRepositoryPort | null = null
let documentsRepository: DocumentsReadRepositoryPort | null = null

export function setMilestonesRepository(repo: MilestonesReadRepositoryPort): void {
  milestonesRepository = repo
}

export function getMilestonesRepository(): MilestonesReadRepositoryPort {
  if (!milestonesRepository) {
    throw new Error('MilestonesRepository not configured')
  }
  return milestonesRepository
}

export function setUpdatesRepository(repo: UpdatesReadRepositoryPort): void {
  updatesRepository = repo
}

export function getUpdatesRepository(): UpdatesReadRepositoryPort {
  if (!updatesRepository) {
    throw new Error('UpdatesRepository not configured')
  }
  return updatesRepository
}

export function setDocumentsRepository(repo: DocumentsReadRepositoryPort): void {
  documentsRepository = repo
}

export function getDocumentsRepository(): DocumentsReadRepositoryPort {
  if (!documentsRepository) {
    throw new Error('DocumentsRepository not configured')
  }
  return documentsRepository
}
