import type { IAuthService } from '@/infrastructure/services/IAuthService'

let authServiceInstance: IAuthService | null = null

export const setAuthService = (authService: IAuthService): void => {
  authServiceInstance = authService
}

export const getAuthService = (): IAuthService => {
  if (!authServiceInstance) {
    throw new Error('AuthService no configurado. Llamar setAuthService() en composition root.')
  }
  return authServiceInstance
}
