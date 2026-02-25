

export interface GoogleOAuthProvider {
  loadScript(): void
  isReady(): boolean
  initialize(
    clientId: string,
    onCredential: (credential: string) => void,
    onError?: (error: any) => void
  ): void
  renderButton(container: HTMLElement): void
  disableAutoSelect(): void
}

export class DefaultGoogleOAuthProvider implements GoogleOAuthProvider {
  loadScript(): void {
    if (typeof document === 'undefined') return
    try {
      if (document.getElementById('google-jssdk')) {
        return
      }
      const script = document.createElement('script')
      script.id = 'google-jssdk'
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      // Optional SRI support if hash provided via env
      try {
        const integrity = (import.meta as any)?.env?.VITE_GOOGLE_GSI_INTEGRITY
        if (integrity && typeof integrity === 'string' && integrity.length > 10) {
          (script as any).integrity = integrity
          ;(script as any).crossOrigin = 'anonymous'
        }
        // NO establecer crossOrigin si no hay integrity; Google GSI no lo soporta
      } catch {}
      document.head.appendChild(script)
    } catch {
      // swallow
    }
  }

  isReady(): boolean {
    return !!window.google?.accounts?.id
  }

  initialize(
    clientId: string,
    onCredential: (credential: string) => void,
    onError?: (error: any) => void
  ): void {
    if (!this.isReady()) return
    window.google!.accounts.id.initialize({
      client_id: clientId,
      callback: (response: { credential: string }) => onCredential(response.credential),
      ux_mode: 'popup',
      auto_select: false,
      error_callback: onError
    })
  }

  renderButton(container: HTMLElement): void {
    if (!this.isReady()) return
    window.google!.accounts.id.renderButton(container, {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      locale: 'es'
    })
  }

  disableAutoSelect(): void {
    try {
      window.google?.accounts?.id?.disableAutoSelect()
    } catch {
      // ignore
    }
  }
}

export async function getGoogleOAuthToken() {
  try {
    // ...existing code...
  } catch (error) {
    logger.event('error', {
      code: 'GOOGLE_OAUTH_TOKEN_FETCH_FAILED',
      context: 'Error obteniendo token de Google OAuth',
      safeDetails: { errorType: error instanceof Error ? error.name : typeof error }
    })
    throw error
  }
}
import { logger } from '@/infrastructure/logging/logger'
