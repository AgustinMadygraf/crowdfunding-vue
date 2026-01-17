/**
 * Repositories Index
 * Export central para todos los repositorios de datos
 */

export { 
  ContributionsRepository, 
  contributionsRepository
} from './ContributionsRepository'

export {
  ContributionRepositoryError,
  type CreateContributionDTO,
  type ContributionResponse,
  type UserContribution,
  type PaginatedContributions
} from '@/application/ports/ContributionsRepository'

export { 
  MilestonesRepository, 
  milestonesRepository,
  MilestoneRepositoryError,
  type MilestoneWithEvidences
} from './MilestonesRepository'

export { 
  UpdatesRepository, 
  updatesRepository,
  UpdateRepositoryError,
  type GetUpdatesParams
} from './UpdatesRepository'

export { 
  DocumentsRepository, 
  documentsRepository,
  DocumentRepositoryError,
  type GetDocumentsParams
} from './DocumentsRepository'
