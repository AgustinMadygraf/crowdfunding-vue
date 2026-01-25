import type { GoogleSignInPort } from '@/application/ports/GoogleSignInPort'
import { DefaultGoogleOAuthProvider, type GoogleOAuthProvider } from './googleOAuthProvider'

export class GoogleSignInAdapter implements GoogleSignInPort {
  private readonly provider: GoogleOAuthProvider

  constructor(provider?: GoogleOAuthProvider) {
    this.provider = provider ?? new DefaultGoogleOAuthProvider()
  }

  loadScript(): void {
    this.provider.loadScript()
  }

  isReady(): boolean {
    return this.provider.isReady()
  }

  initialize(
    clientId: string,
    onCredential: (credential: string) => void,
    onError: (error: unknown) => void
  ): void {
    this.provider.initialize(clientId, onCredential, onError)
  }

  renderButton(container: HTMLElement): void {
    this.provider.renderButton(container)
  }

  disableAutoSelect(): void {
    this.provider.disableAutoSelect()
  }
}
