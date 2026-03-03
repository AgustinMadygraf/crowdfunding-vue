import type { User, UserRole } from '@/domain/user'

type AuthMePayload = Record<string, unknown>
type ParseFormat = 'envelope' | 'legacy_root' | 'invalid'

const isObjectRecord = (value: unknown): value is AuthMePayload =>
  typeof value === 'object' && value !== null

const allowedRoles: UserRole[] = ['user', 'admin', 'superuser']

const parseRoles = (value: unknown): UserRole[] | undefined => {
  if (!Array.isArray(value)) {
    return undefined
  }

  const parsed = value.filter((role): role is UserRole =>
    typeof role === 'string' && allowedRoles.includes(role as UserRole)
  )

  return parsed.length > 0 ? parsed : undefined
}

const parseUser = (candidate: unknown): User | null => {
  if (!isObjectRecord(candidate)) {
    return null
  }

  const id = candidate.id
  const email = candidate.email
  const nombre = candidate.nombre
  const avatar = candidate.avatar_url

  if (typeof id !== 'string' || typeof email !== 'string' || typeof nombre !== 'string') {
    return null
  }

  return {
    id,
    email,
    nombre,
    avatar_url: typeof avatar === 'string' ? avatar : undefined,
    roles: parseRoles(candidate.roles)
  }
}

export interface ParseAuthMeResult {
  format: ParseFormat
  user: User | null
}

export const parseAuthMeResponse = (payload: unknown): ParseAuthMeResult => {
  if (!isObjectRecord(payload)) {
    return { format: 'invalid', user: null }
  }

  if (isObjectRecord(payload.user)) {
    return {
      format: 'envelope',
      user: parseUser(payload.user)
    }
  }

  return {
    format: 'legacy_root',
    user: parseUser(payload)
  }
}
