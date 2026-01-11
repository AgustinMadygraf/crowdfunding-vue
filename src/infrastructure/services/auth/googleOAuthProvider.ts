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
