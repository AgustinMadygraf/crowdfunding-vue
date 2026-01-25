import type { User } from '@/domain/user'
import type { SessionStoragePort } from '@/application/ports/SessionStoragePort'
import type { ValidateJwtUseCase } from '@/application/usecases/ValidateJwtUseCase'

export interface LoadStoredAuthResult {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  shouldLogout: boolean
}

export class LoadStoredAuthUseCase {
  constructor(
    private readonly storage: SessionStoragePort,
    private readonly validateJwt: ValidateJwtUseCase
  ) {}

  execute(): LoadStoredAuthResult {
    const { token, user } = this.storage.load()
    if (!token || !user) {
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        shouldLogout: false
      }
    }

    const validation = this.validateJwt.execute(token)
    if (!validation.isValid && validation.reason === 'expired') {
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        shouldLogout: true
      }
    }

    return {
      user,
      token,
      isAuthenticated: true,
      shouldLogout: false
    }
  }
}
