import type { User } from '@/domain/user'

export interface AuthState {
  readonly user: User | null
  readonly token: string | null
  readonly isAuthenticated: boolean
  readonly isLoading: boolean
  readonly error: string | null
}

export interface MutableAuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface GoogleAuthConfig {
  configured: boolean
  clientIdPrefix: string
}

export interface IAuthQuery {
  getCurrentUser(): User | null
  getAuthToken(): string | null
  isAuthenticated(): boolean
  getAuthState(): Readonly<AuthState>
  getAuthHeaders(): Record<string, string>
  isGoogleConfigured(): boolean
  getConfigInfo(): GoogleAuthConfig
  refreshTokenIfNeeded(): Promise<boolean>
}

export interface IAuthCommand {
  loginWithGoogle(token: string): Promise<User>
  logout(): void
  initGoogleSignIn(containerId: string, callback: (token: string) => void): void
}

export interface IAuthService extends IAuthQuery, IAuthCommand {}

export type AuthServiceFactory = (config?: AuthServiceConfig) => IAuthService

export interface AuthServiceConfig {
  apiBaseUrl?: string
  googleClientId?: string
  tokenStorageKey?: string
  userStorageKey?: string
}
