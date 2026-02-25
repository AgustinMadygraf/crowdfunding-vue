import { AppError } from '@/application/errors/appError'
import { ContributionRepositoryError } from '@/application/ports/ContributionsRepository'
import { DocumentRepositoryError } from '@/infrastructure/repositories/DocumentsRepository'
import { MilestoneRepositoryError } from '@/infrastructure/repositories/MilestonesRepository'
import { UpdateRepositoryError } from '@/infrastructure/repositories/UpdatesRepository'

type RepositoryError =
  | ContributionRepositoryError
  | DocumentRepositoryError
  | MilestoneRepositoryError
  | UpdateRepositoryError

const isRepositoryError = (err: unknown): err is RepositoryError => {
  return (
    err instanceof ContributionRepositoryError ||
    err instanceof DocumentRepositoryError ||
    err instanceof MilestoneRepositoryError ||
    err instanceof UpdateRepositoryError
  )
}

const resolveTypeByStatus = (statusCode?: number) => {
  if (!statusCode) return 'UNKNOWN' as const
  if (statusCode === 401 || statusCode === 403) return 'AUTH' as const
  if (statusCode === 404) return 'NOT_FOUND' as const
  if (statusCode >= 500) return 'SERVER' as const
  if (statusCode >= 400) return 'VALIDATION' as const
  return 'UNKNOWN' as const
}

export const toAppError = (err: unknown, fallbackMessage = 'Error desconocido'): AppError => {
  if (err instanceof AppError) {
    return err
  }

  if (isRepositoryError(err)) {
    return new AppError({
      message: err.message || fallbackMessage,
      type: resolveTypeByStatus(err.statusCode),
      code: `REPO_${resolveTypeByStatus(err.statusCode)}`,
      statusCode: err.statusCode,
      safeDetails: { source: err.name }
    })
  }

  if (err instanceof Error) {
    return new AppError({
      message: err.message || fallbackMessage,
      type: 'UNKNOWN',
      code: 'JS_ERROR'
    })
  }

  return new AppError({
    message: fallbackMessage,
    type: 'UNKNOWN',
    code: 'NON_ERROR_THROWN'
  })
}
