import type { User } from '@/domain/user'

export interface SessionStoragePort {
  save(user: User, token: string): void
  load(): { user: User | null; token: string | null }
  clear(): void
}
