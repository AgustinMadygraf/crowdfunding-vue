/**
 * Auth Store (Pinia)
 * Estado reactivo sincronizado con AuthService
 */
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { authService } from '@/infrastructure/services/authServiceFactory'
import type { User } from '@/domain/user'
import type { AuthState } from '@/infrastructure/services/IAuthService'


const mapStateFromService = (): AuthState => {
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
    isLoading.value = true
    error.value = null
    try {
      const authenticatedUser = await authService.loginWithGoogle(googleToken)
      hydrateFromService()
      return authenticatedUser
    } catch (err) {
      console.error('Error en login (authStore)', err)
      error.value = err instanceof Error ? err.message : 'Error desconocido de autenticación'
      isAuthenticated.value = false
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    authService.logout()
    hydrateFromService()
  }

  const getAuthHeaders = computed(() => authService.getAuthHeaders())

  // Inicializar estado desde storage al crear store
  hydrateFromService()

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    // Getters
    getAuthHeaders,
    // Actions
    hydrateFromService,
    loginWithGoogle,
    logout
  }
})
