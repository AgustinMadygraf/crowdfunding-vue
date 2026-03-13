import type { CsrfPort } from '@/application/ports/CsrfPort'
import { csrfService } from './csrfService'

export const csrfServiceAdapter: CsrfPort = {
  getToken: () => csrfService.getToken(),
  readFromCookie: (cookieName) => csrfService.readFromCookie(cookieName),
  readFromHeader: (headerName) => csrfService.readFromHeader(headerName),
  setToken: (token) => csrfService.setToken(token),
  getTokenHeader: (token, headerName) => csrfService.getTokenHeader(token, headerName)
}
