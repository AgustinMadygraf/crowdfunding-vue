import type { User } from '@/domain/user'
import { Logger } from '@/infrastructure/logger'

export interface TokenStorage {
  load(): { user: User | null; token: string | null }
  save(user: User, token: string): void
  clear(): void
}

/**
 * localStorage-based token storage
 * ⚠️ DEPRECATED: Vulnerable a XSS. Usar SessionStorageTokenStorage en lugar
 */
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
      Logger.error('Error guardando token', e)
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

/**
 * sessionStorage-based token storage (RECOMENDADO)
 * Más seguro que localStorage:
 * - Se limpia automáticamente al cerrar pestaña
 * - No persiste entre sesiones
 * - Reducido riesgo de XSS (token solo en sesión actual)
 */
export class SessionStorageTokenStorage implements TokenStorage {
  constructor(private tokenKey: string, private userKey: string) {}

  load(): { user: User | null; token: string | null } {
    try {
      const token = sessionStorage.getItem(this.tokenKey)
      const userStr = sessionStorage.getItem(this.userKey)
      const user = userStr ? (JSON.parse(userStr) as User) : null
      return { user, token }
    } catch (e) {
      return { user: null, token: null }
    }
  }

  save(user: User, token: string): void {
    try {
      sessionStorage.setItem(this.tokenKey, token)
      sessionStorage.setItem(this.userKey, JSON.stringify(user))
      if (import.meta.env.DEV) {
        console.log('[SessionStorageTokenStorage] ✅ Token guardado en sessionStorage')
      }
    } catch (e) {
      Logger.error('Error guardando token en sessionStorage', e)
      // Ignore storage errors; session becomes non-persistent
      if (import.meta.env.DEV) {
        console.warn('[SessionStorageTokenStorage] ⚠️ No se pudo guardar en sessionStorage')
      }
    }
  }

  clear(): void {
    try {
      sessionStorage.removeItem(this.tokenKey)
      sessionStorage.removeItem(this.userKey)
      if (import.meta.env.DEV) {
        console.log('[SessionStorageTokenStorage] ✅ Token eliminado de sessionStorage')
      }
    } catch (e) {
      // Ignore
    }
  }
}

/**
 * Memory-only token storage para máxima seguridad
 * Usado cuando backend envía httpOnly cookies
 * - Token NUNCA se almacena en storage
 * - Cookies se envían automáticamente por navegador
 * - Se pierde sesión al recargar página (mejor UX con backend refresh token)
 */
export class MemoryOnlyTokenStorage implements TokenStorage {
  private token: string | null = null
  private user: User | null = null

  load(): { user: User | null; token: string | null } {
    return { user: this.user, token: this.token }
  }

  save(user: User, token: string): void {
    this.user = user
    this.token = token
    if (import.meta.env.DEV) {
      console.log('[MemoryOnlyTokenStorage] ✅ Token en memoria (no persiste)')
    }
  }

  clear(): void {
    this.user = null
    this.token = null
    if (import.meta.env.DEV) {
      console.log('[MemoryOnlyTokenStorage] ✅ Token eliminado de memoria')
    }
  }
}

export function saveToken(token: string) {
  try {
    // ...existing code...
  } catch (error) {
    Logger.error('Error guardando token', error)
    throw error
  }
}

