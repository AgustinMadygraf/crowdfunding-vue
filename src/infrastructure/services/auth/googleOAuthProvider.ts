export interface GoogleOAuthProvider {
  loadScript(): void
  isReady(): boolean
  initialize(
    clientId: string,
    onCredential: (credential: string) => void,
    onError?: (error: unknown) => void
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
        const integrity = (import.meta as { env?: Record<string, string | undefined> }).env
          ?.VITE_GOOGLE_GSI_INTEGRITY
        if (integrity && integrity.length > 10) {
          script.integrity = integrity
          script.crossOrigin = 'anonymous'
        }
      } catch {
        // ignore integrity configuration errors
      }

      document.head.appendChild(script)
    } catch {
      // ignore script injection errors
    }
  }

  isReady(): boolean {
    return !!window.google?.accounts?.id
  }

  initialize(
    clientId: string,
    onCredential: (credential: string) => void,
    onError?: (error: unknown) => void
  ): void {
    const googleId = window.google?.accounts?.id
    if (!googleId) return

    googleId.initialize({
      client_id: clientId,
      callback: (response: { credential: string }) => onCredential(response.credential),
      ux_mode: 'popup',
      auto_select: false,
      error_callback: onError as ((error: unknown) => void) | undefined
    })
  }

  renderButton(container: HTMLElement): void {
    const googleId = window.google?.accounts?.id
    if (!googleId) return

    googleId.renderButton(container, {
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
