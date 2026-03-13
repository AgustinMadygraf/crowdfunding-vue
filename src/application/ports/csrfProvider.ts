import type { CsrfPort } from './CsrfPort'

const noopCsrfService: CsrfPort = {
  getToken: () => null,
  readFromCookie: () => null,
  readFromHeader: () => null,
  setToken: () => {},
  getTokenHeader: () => ({})
}

let csrfService: CsrfPort = noopCsrfService

export function setCsrfService(service: CsrfPort): void {
  csrfService = service
}

export function getCsrfService(): CsrfPort {
  return csrfService
}
