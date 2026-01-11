/**
 * Services Index
 * Export central para todos los servicios de API
 */

export { milestonesService } from './milestonesService'
export { subscriptionsService } from './subscriptionsService'
export { updatesService } from './updatesService'
export { documentsService } from './documentsService'

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
