import type { User } from '@/domain/user'
import type { SessionStoragePort } from '@/application/ports/SessionStoragePort'

export interface LogoutResult {
  nextState: {
    user: User | null
    token: string | null
    isAuthenticated: false
    error: null
  }
}

export class LogoutUseCase {
  constructor(private readonly storage: SessionStoragePort) {}

  execute(): LogoutResult {
    this.storage.clear()
    return {
      nextState: {
        user: null,
        token: null,
        isAuthenticated: false,
        error: null
      }
    }
  }
}
