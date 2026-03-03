/**
 * Services Index
 * Export central para servicios de infraestructura activos
 */

export { csrfService } from './csrfService'
export type { ICsrfService } from './csrfService'

// Auth service - clase y factory
export { AuthService } from './authService'
export { createAuthService, authService } from './authServiceFactory'
export type { 
  IAuthService, 
  IAuthQuery, 
  IAuthCommand, 
  AuthState, 
  MutableAuthState, 
  GoogleAuthConfig, 
  AuthServiceConfig 
} from './IAuthService'
