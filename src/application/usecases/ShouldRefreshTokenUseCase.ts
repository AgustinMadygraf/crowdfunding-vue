export class ShouldRefreshTokenUseCase {
  constructor(private readonly thresholdSeconds = 300) {}

  execute(token: string): { shouldRefresh: boolean; canEvaluate: boolean } {
    const payload = this.decodeJwt(token)
    if (!payload?.exp) {
      return { shouldRefresh: false, canEvaluate: false }
    }

    const now = Math.floor(Date.now() / 1000)
    const expiresIn = payload.exp - now
    return { shouldRefresh: expiresIn < this.thresholdSeconds, canEvaluate: true }
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
