import { describe, expect, it } from 'vitest'
import { parseAuthMeResponse } from '@/infrastructure/services/auth/authMeParser'

describe('parseAuthMeResponse', () => {
  it('parsea formato canonico con envelope user', () => {
    const result = parseAuthMeResponse({
      user: {
        id: 'u-1',
        email: 'user@example.com',
        nombre: 'User One',
        avatar_url: 'https://img.test/avatar.png',
        roles: ['admin', 'user']
      }
    })

    expect(result.format).toBe('envelope')
    expect(result.user).toEqual({
      id: 'u-1',
      email: 'user@example.com',
      nombre: 'User One',
      avatar_url: 'https://img.test/avatar.png',
      roles: ['admin', 'user']
    })
  })

  it('mantiene compatibilidad con formato legacy en raiz', () => {
    const result = parseAuthMeResponse({
      id: 'u-2',
      email: 'legacy@example.com',
      nombre: 'Legacy User'
    })

    expect(result.format).toBe('legacy_root')
    expect(result.user).toEqual({
      id: 'u-2',
      email: 'legacy@example.com',
      nombre: 'Legacy User',
      avatar_url: undefined,
      roles: undefined
    })
  })

  it('retorna invalido cuando faltan campos requeridos', () => {
    const result = parseAuthMeResponse({
      user: {
        email: 'broken@example.com'
      }
    })

    expect(result.format).toBe('envelope')
    expect(result.user).toBeNull()
  })
})
