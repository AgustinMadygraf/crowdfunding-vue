import type { User } from '@/domain/user'

export interface TokenStorage {
  load(): { user: User | null; token: string | null }
  save(user: User, token: string): void
  clear(): void
}

export class DefaultTokenStorage implements TokenStorage {
  constructor(private tokenKey: string, private userKey: string) {}

  load(): { user: User | null; token: string | null } {
    try {
      const token = localStorage.getItem(this.tokenKey)
      const userStr = localStorage.getItem(this.userKey)
      const user = userStr ? (JSON.parse(userStr) as User) : null
      return { user, token }
    } catch (e) {
      return { user: null, token: null }
    }
  }

  save(user: User, token: string): void {
    try {
      localStorage.setItem(this.tokenKey, token)
      localStorage.setItem(this.userKey, JSON.stringify(user))
    } catch (e) {
      // Ignore storage errors; session becomes non-persistent
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(this.tokenKey)
      localStorage.removeItem(this.userKey)
    } catch (e) {
      // Ignore
    }
  }
}
