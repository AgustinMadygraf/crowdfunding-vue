import { beforeEach, describe, expect, it } from 'vitest'
import { DefaultCsrfService } from '@/infrastructure/services/csrfService'

describe('DefaultCsrfService', () => {
  let service: DefaultCsrfService

  beforeEach(() => {
    service = new DefaultCsrfService()
    document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
    document.head.innerHTML = ''
  })

  it('lee token desde cookie', () => {
    document.cookie = 'XSRF-TOKEN=test-cookie-token; path=/'
    expect(service.readFromCookie()).toBe('test-cookie-token')
  })

  it('lee token desde meta tag', () => {
    const meta = document.createElement('meta')
    meta.setAttribute('name', 'X-CSRF-Token')
    meta.setAttribute('content', 'meta-token')
    document.head.appendChild(meta)

    expect(service.readFromHeader()).toBe('meta-token')
  })

  it('arma header CSRF cuando existe token', () => {
    service.setToken('memory-token')
    expect(service.getTokenHeader()).toEqual({ 'X-CSRF-Token': 'memory-token' })
  })

  it('retorna objeto vacío cuando no hay token', () => {
    expect(service.getTokenHeader('')).toEqual({})
  })
})
