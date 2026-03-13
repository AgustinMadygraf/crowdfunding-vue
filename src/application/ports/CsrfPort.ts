export interface CsrfPort {
  getToken(): string | null
  readFromCookie(cookieName?: string): string | null
  readFromHeader(headerName?: string): string | null
  setToken(token: string): void
  getTokenHeader(token: string, headerName?: string): Record<string, string>
}
