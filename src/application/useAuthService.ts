import { inject } from 'vue'
import type { IAuthService } from '@/infrastructure/services/IAuthService'
import { authService as defaultAuthService } from '@/infrastructure/services/authServiceFactory'

export const AUTH_SERVICE_KEY = 'authService' as const

export function useAuthService(): IAuthService {
  return inject<IAuthService>(AUTH_SERVICE_KEY) ?? defaultAuthService
}
