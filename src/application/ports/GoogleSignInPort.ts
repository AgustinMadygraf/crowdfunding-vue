export interface GoogleSignInPort {
  loadScript(): void
  isReady(): boolean
  initialize(
    clientId: string,
    onCredential: (credential: string) => void,
    onError: (error: unknown) => void
  ): void
  renderButton(container: HTMLElement): void
  disableAutoSelect(): void
}
