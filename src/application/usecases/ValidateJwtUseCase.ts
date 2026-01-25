export interface JwtValidationResult {
  isValid: boolean
  payload?: { exp?: number }
  reason?: 'invalid_format' | 'decode_error' | 'missing_exp' | 'expired'
}

export class ValidateJwtUseCase {
  execute(token: string): JwtValidationResult {
    const payload = this.decodeJwt(token)
    if (!payload) {
      return { isValid: false, reason: 'invalid_format' }
    }
    if (!payload.exp) {
      return { isValid: true, payload, reason: 'missing_exp' }
    }

    const now = Math.floor(Date.now() / 1000)
    if (now >= payload.exp) {
      return { isValid: false, payload, reason: 'expired' }
    }

    return { isValid: true, payload }
  }

  private decodeJwt(token: string): { exp?: number } | null {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) return null

      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload) as { exp?: number }
    } catch {
      return null
    }
  }
}
