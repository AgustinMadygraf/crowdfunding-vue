import type { CsrfPort } from './CsrfPort'

let csrfService: CsrfPort | null = null

export function setCsrfService(service: CsrfPort): void {
  csrfService = service
}

export function getCsrfService(): CsrfPort {
  if (!csrfService) {
    throw new Error('CsrfService not configured')
  }
  return csrfService
}
