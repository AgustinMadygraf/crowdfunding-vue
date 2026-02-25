import { ContributionRepositoryError } from '@/application/ports/ContributionsRepository'
import { normalizeErrorMessage } from '@/application/errors/normalizeError'

export const mapContributionError = (err: unknown): string => {
  if (err instanceof ContributionRepositoryError) {
    if (err.statusCode === 401) {
      return 'Sesion expirada. Por favor, cerra sesion y volve a ingresar.'
    }
    if (err.statusCode === 403) {
      return 'No tenes permisos para realizar esta accion.'
    }
    if (err.statusCode && err.statusCode >= 500) {
      return 'Error del servidor. Por favor, intenta de nuevo mas tarde.'
    }
    return err.message || 'Error al procesar la contribucion'
  }
  return normalizeErrorMessage(err)
}
