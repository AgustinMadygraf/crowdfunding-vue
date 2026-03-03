
import { inject } from 'vue'
import type { IAuthService } from '@/application/ports/AuthService'
import { getAuthService } from '@/presentation/providers/authServiceProvider'

export const AUTH_SERVICE_KEY = 'authService' as const

export function useAuthService(): IAuthService {
  return inject<IAuthService>(AUTH_SERVICE_KEY) ?? getAuthService()
}
