import { describe, it, expect, vi, afterEach } from 'vitest'
import { ValidateJwtUseCase } from '@/application/usecases/ValidateJwtUseCase'
import { ShouldRefreshTokenUseCase } from '@/application/usecases/ShouldRefreshTokenUseCase'
import { BuildAuthHeadersUseCase } from '@/application/usecases/BuildAuthHeadersUseCase'
import { RateLimitLoginUseCase } from '@/application/usecases/RateLimitLoginUseCase'
import { GetGoogleConfigInfoUseCase } from '@/application/usecases/GetGoogleConfigInfoUseCase'
import { LoadStoredAuthUseCase } from '@/application/usecases/LoadStoredAuthUseCase'
import { LogoutUseCase } from '@/application/usecases/LogoutUseCase'
import { LoginWithGoogleUseCase } from '@/application/usecases/LoginWithGoogleUseCase'
import type { SessionStoragePort } from '@/application/ports/SessionStoragePort'
import type { AuthGatewayPort } from '@/application/ports/AuthGateway'
import type { User } from '@/domain/user'

const createJwt = (payload: Record<string, unknown>): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  return `${header}.${body}.signature`
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ValidateJwtUseCase', () => {
  it('valida token con exp futura', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000)
    const useCase = new ValidateJwtUseCase()
    const token = createJwt({ exp: 1_700_000_100 })

    const result = useCase.execute(token)

    expect(result.isValid).toBe(true)
    expect(result.payload?.exp).toBe(1_700_000_100)
  })

  it('invalida token expirado', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000)
    const useCase = new ValidateJwtUseCase()
    const token = createJwt({ exp: 1_600_000_000 })

    const result = useCase.execute(token)

    expect(result.isValid).toBe(false)
    expect(result.reason).toBe('expired')
  })
})

describe('ShouldRefreshTokenUseCase', () => {
  it('marca refresh cuando faltan menos de 5 minutos', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000)
    const useCase = new ShouldRefreshTokenUseCase(300)
    const token = createJwt({ exp: 1_700_000_100 })

    const result = useCase.execute(token)

    expect(result.canEvaluate).toBe(true)
    expect(result.shouldRefresh).toBe(true)
  })

  it('no evalua token inválido', () => {
    const useCase = new ShouldRefreshTokenUseCase()
    const result = useCase.execute('invalid.token')

    expect(result.canEvaluate).toBe(false)
    expect(result.shouldRefresh).toBe(false)
  })
})

describe('BuildAuthHeadersUseCase', () => {
  it('incluye Authorization cuando recibe token', () => {
    const useCase = new BuildAuthHeadersUseCase()
    const result = useCase.execute('abc')

    expect(result).toEqual({
      'Content-Type': 'application/json',
      Authorization: 'Bearer abc'
    })
  })

  it('omite Authorization cuando token es null', () => {
    const useCase = new BuildAuthHeadersUseCase()
    const result = useCase.execute(null)

    expect(result).toEqual({
      'Content-Type': 'application/json'
    })
  })
})

describe('RateLimitLoginUseCase', () => {
  it('bloquea cuando supera intentos en la ventana', () => {
    const useCase = new RateLimitLoginUseCase(2, 60_000)
    const state = {
      attempts: [{ timestamp: 1000 }, { timestamp: 2000 }]
    }

    const result = useCase.execute(state, 3000)

    expect(result.allowed).toBe(false)
    expect(result.waitTimeSeconds).toBeGreaterThan(0)
    expect(result.nextState.attempts).toHaveLength(2)
  })

  it('permite y agrega intento cuando está debajo del límite', () => {
    const useCase = new RateLimitLoginUseCase(3, 60_000)
    const result = useCase.execute({ attempts: [{ timestamp: 1000 }] }, 2000)

    expect(result.allowed).toBe(true)
    expect(result.nextState.attempts).toHaveLength(2)
  })
})

describe('GetGoogleConfigInfoUseCase', () => {
  it('reporta configurado y prefijo truncado', () => {
    const useCase = new GetGoogleConfigInfoUseCase()
    const result = useCase.execute('12345678901234567890-client')

    expect(result.configured).toBe(true)
    expect(result.clientIdPrefix).toBe('12345678901234567890...')
  })
})

describe('LoadStoredAuthUseCase', () => {
  it('retorna autenticado cuando token es válido', () => {
    const user: User = { id: '1', email: 'test@test.com', nombre: 'Test' }
    const storage: SessionStoragePort = {
      save: vi.fn(),
      load: vi.fn(() => ({ user, token: 'token' })),
      clear: vi.fn()
    }
    const validateJwt = { execute: vi.fn(() => ({ isValid: true })) } as unknown as ValidateJwtUseCase
    const useCase = new LoadStoredAuthUseCase(storage, validateJwt)

    const result = useCase.execute()

    expect(result.isAuthenticated).toBe(true)
    expect(result.shouldLogout).toBe(false)
    expect(result.user).toEqual(user)
  })

  it('solicita logout cuando token almacenado es inválido', () => {
    const storage: SessionStoragePort = {
      save: vi.fn(),
      load: vi.fn(() => ({
        user: { id: '1', email: 'test@test.com', nombre: 'Test' },
        token: 'expired'
      })),
      clear: vi.fn()
    }
    const validateJwt = { execute: vi.fn(() => ({ isValid: false })) } as unknown as ValidateJwtUseCase
    const useCase = new LoadStoredAuthUseCase(storage, validateJwt)

    const result = useCase.execute()

    expect(result.isAuthenticated).toBe(false)
    expect(result.shouldLogout).toBe(true)
    expect(result.user).toBeNull()
  })
})

describe('LogoutUseCase', () => {
  it('limpia storage y devuelve estado no autenticado', () => {
    const storage: SessionStoragePort = {
      save: vi.fn(),
      load: vi.fn(() => ({ user: null, token: null })),
      clear: vi.fn()
    }
    const useCase = new LogoutUseCase(storage)

    const result = useCase.execute()

    expect(storage.clear).toHaveBeenCalledOnce()
    expect(result.nextState.isAuthenticated).toBe(false)
    expect(result.nextState.user).toBeNull()
    expect(result.nextState.token).toBeNull()
  })
})

describe('LoginWithGoogleUseCase', () => {
  it('mapea la respuesta del gateway a User + authToken', async () => {
    const gateway: AuthGatewayPort = {
      loginWithGoogle: vi.fn(async () => ({
        user_id: 'u1',
        email: 'u1@test.com',
        nombre: 'User One',
        avatar_url: 'https://img.test/u1.png',
        auth_token: 'jwt-token'
      })),
      refreshToken: vi.fn()
    }
    const useCase = new LoginWithGoogleUseCase(gateway)

    const result = await useCase.execute('google-token')

    expect(result.authToken).toBe('jwt-token')
    expect(result.user).toEqual({
      id: 'u1',
      email: 'u1@test.com',
      nombre: 'User One',
      avatar_url: 'https://img.test/u1.png'
    })
  })
})
