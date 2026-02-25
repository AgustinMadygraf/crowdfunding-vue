import { AppError } from '@/application/errors/appError'
import { ContributionRepositoryError } from '@/application/ports/ContributionsRepository'

interface ErrorLikeWithStatus {
  name?: string
  message?: string
  statusCode?: number
}

const isErrorLikeWithStatus = (err: unknown): err is ErrorLikeWithStatus => {
  return (
    typeof err === 'object' &&
    err !== null &&
    ('message' in err || 'statusCode' in err || 'name' in err)
  )
}

const isRepositoryError = (err: unknown): err is ErrorLikeWithStatus => {
  if (err instanceof ContributionRepositoryError) {
    return true
  }

  if (!isErrorLikeWithStatus(err)) {
    return false
  }

  const name = err.name ?? ''
  return name.endsWith('RepositoryError')
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
    const source = err.name ?? 'RepositoryError'
    const statusCode = err.statusCode
    return new AppError({
      message: err.message || fallbackMessage,
      type: resolveTypeByStatus(statusCode),
      code: `REPO_${resolveTypeByStatus(statusCode)}`,
      statusCode,
      safeDetails: { source }
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
