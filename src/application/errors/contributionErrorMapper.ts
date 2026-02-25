import { toAppError } from '@/application/errors/toAppError'

export const mapContributionError = (err: unknown): string => {
  const appError = toAppError(err, 'Error al procesar la contribucion')

  if (appError.type === 'AUTH') {
    if (appError.statusCode === 401) {
      return 'Sesion expirada. Por favor, cerra sesion y volve a ingresar.'
    }
    if (appError.statusCode === 403) {
      return 'No tenes permisos para realizar esta accion.'
    }
  }

  if (appError.type === 'SERVER') {
    return 'Error del servidor. Por favor, intenta de nuevo mas tarde.'
  }

  return appError.message
}
