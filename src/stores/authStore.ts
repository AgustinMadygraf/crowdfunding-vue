/**
 * Auth Store (Pinia)
 * Estado reactivo sincronizado con AuthService
 */
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { toAppError } from '@/application/errors/toAppError'
import { logger } from '@/infrastructure/logging/logger'
import type { User } from '@/domain/user'
import type { AuthState } from '@/infrastructure/services/IAuthService'
import { getAuthService } from '@/presentation/providers/authServiceProvider'

const mapStateFromService = (): AuthState => {
  const authService = getAuthService()
  const state = authService.getAuthState()
  return {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const hydrateFromService = () => {
    const state = mapStateFromService()
    user.value = state.user
    token.value = state.token
    isAuthenticated.value = state.isAuthenticated
    isLoading.value = state.isLoading
    error.value = state.error
  }

  const loginWithGoogle = async (googleToken: string): Promise<User> => {
    const authService = getAuthService()
    isLoading.value = true
    error.value = null
    try {
      const authenticatedUser = await authService.loginWithGoogle(googleToken)
      hydrateFromService()
      return authenticatedUser
    } catch (err) {
      const appError = toAppError(err, 'Error desconocido de autenticacion')
      logger.event('error', {
        code: 'AUTH_STORE_LOGIN_FAILED',
        context: appError.message,
        safeDetails: { type: appError.type, statusCode: appError.statusCode }
      })
      error.value = appError.message
      isAuthenticated.value = false
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    const authService = getAuthService()
    authService.logout()
    hydrateFromService()
  }

  const getAuthHeaders = computed(() => getAuthService().getAuthHeaders())

  hydrateFromService()

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    getAuthHeaders,
    hydrateFromService,
    loginWithGoogle,
    logout
  }
})
