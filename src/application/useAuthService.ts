
import { inject } from 'vue'
import type { IAuthService } from '@/infrastructure/services/IAuthService'
import { authService as defaultAuthService } from '@/infrastructure/services/authServiceFactory'
import type { Credentials } from '@/domain/user'

export const AUTH_SERVICE_KEY = 'authService' as const

export function useAuthService(): IAuthService {
  return inject<IAuthService>(AUTH_SERVICE_KEY) ?? defaultAuthService
}

// Ejemplo de uso en login
async function login(credentials: Credentials) {
  try {
    // ...existing code...
  } catch (error) {
    console.error('Login error', error)
    throw error
  }
}
