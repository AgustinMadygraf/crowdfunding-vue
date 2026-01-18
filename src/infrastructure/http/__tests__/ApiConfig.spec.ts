/**
 * Tests para ApiConfig
 * 
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ApiConfig, resetApiConfig } from '../ApiConfig'

describe('ApiConfig', () => {
  beforeEach(() => {
    resetApiConfig()
  })

  afterEach(() => {
    resetApiConfig()
  })

  describe('create()', () => {
    it('debe crear configuración con valores por defecto', () => {
      const config = ApiConfig.create()

      expect(config.baseUrl).toBe('http://localhost:5000')
      expect(config.apiPrefix).toBe('/api')
      expect(config.timeout).toBe(15000)
      expect(config.retryAttempts).toBe(3)
      expect(config.skipNgrokWarning).toBe(false)
    })

    it('debe crear configuración con valores custom', () => {
      const config = ApiConfig.create({
        baseUrl: 'https://api.example.com',
        apiPrefix: '/v1',
        timeout: 30000,
        retryAttempts: 5,
        skipNgrokWarning: true
      })

      expect(config.baseUrl).toBe('https://api.example.com')
      expect(config.apiPrefix).toBe('/v1')
      expect(config.timeout).toBe(30000)
      expect(config.retryAttempts).toBe(5)
      expect(config.skipNgrokWarning).toBe(true)
    })

    it('debe normalizar baseUrl removiendo trailing slash', () => {
      const config = ApiConfig.create({
        baseUrl: 'https://api.example.com/'
      })

      expect(config.baseUrl).toBe('https://api.example.com')
    })

    it('debe normalizar apiPrefix agregando leading slash', () => {
      const config = ApiConfig.create({
        apiPrefix: 'api/v1'
      })

      expect(config.apiPrefix).toBe('/api/v1')
    })

    it('debe normalizar apiPrefix removiendo trailing slash', () => {
      const config = ApiConfig.create({
        apiPrefix: '/api/v1/'
      })

      expect(config.apiPrefix).toBe('/api/v1')
    })
  })

  describe('buildUrl()', () => {
    it('debe construir URL completa con prefijo', () => {
      const config = ApiConfig.create({
        baseUrl: 'https://api.example.com',
        apiPrefix: '/api'
      })

      const url = config.buildUrl('/contributions/123')
      expect(url).toBe('https://api.example.com/api/contributions/123')
    })

    it('debe manejar path sin leading slash', () => {
      const config = ApiConfig.create({
        baseUrl: 'https://api.example.com',
        apiPrefix: '/api'
      })

      const url = config.buildUrl('contributions/123')
      expect(url).toBe('https://api.example.com/api/contributions/123')
    })

    it('no debe duplicar prefijo si path ya lo incluye', () => {
      const config = ApiConfig.create({
        baseUrl: 'https://api.example.com',
        apiPrefix: '/api'
      })

      const url = config.buildUrl('/api/contributions/123')
      expect(url).toBe('https://api.example.com/api/contributions/123')
    })

    it('debe funcionar con prefijo vacío', () => {
      const config = ApiConfig.create({
        baseUrl: 'https://api.example.com',
        apiPrefix: ''
      })

      const url = config.buildUrl('/contributions/123')
      expect(url).toBe('https://api.example.com/contributions/123')
    })
  })

  describe('Métodos de recursos', () => {
    let config: ApiConfig

    beforeEach(() => {
      config = ApiConfig.create({
        baseUrl: 'https://api.example.com',
        apiPrefix: '/api'
      })
    })

    it('contributions() debe generar URL correcta sin ID', () => {
      expect(config.contributions()).toBe('https://api.example.com/api/contributions')
    })

    it('contributions() debe generar URL correcta con ID', () => {
      expect(config.contributions('abc123')).toBe('https://api.example.com/api/contributions/abc123')
    })

    it('userContributions() debe generar URL correcta', () => {
      expect(config.userContributions('user_456')).toBe('https://api.example.com/api/users/user_456/contributions')
    })

    it('health() debe generar URL correcta', () => {
      expect(config.health()).toBe('https://api.example.com/api/health')
    })

    it('auth() debe generar URL correcta para diferentes acciones', () => {
      expect(config.auth('login')).toBe('https://api.example.com/api/auth/login')
      expect(config.auth('logout')).toBe('https://api.example.com/api/auth/logout')
      expect(config.auth('refresh')).toBe('https://api.example.com/api/auth/refresh')
      expect(config.auth('verify')).toBe('https://api.example.com/api/auth/verify')
    })
  })

  describe('isNgrokUrl()', () => {
    it('debe detectar URL de ngrok', () => {
      const config = ApiConfig.create({
        baseUrl: 'https://test.ngrok-free.app'
      })

      expect(config.isNgrokUrl()).toBe(true)
    })

    it('debe detectar URL de ngrok con subdominio custom', () => {
      const config = ApiConfig.create({
        baseUrl: 'https://my-app.ngrok.io'
      })

      expect(config.isNgrokUrl()).toBe(true)
    })

    it('no debe detectar como ngrok URLs normales', () => {
      const config = ApiConfig.create({
        baseUrl: 'https://api.example.com'
      })

      expect(config.isNgrokUrl()).toBe(false)
    })
  })

  describe('getDebugInfo()', () => {
    it('debe retornar información de configuración', () => {
      const config = ApiConfig.create({
        baseUrl: 'https://test.ngrok-free.app',
        apiPrefix: '/api/v2',
        timeout: 20000,
        retryAttempts: 5,
        skipNgrokWarning: true
      })

      const debugInfo = config.getDebugInfo()

      expect(debugInfo).toEqual({
        baseUrl: 'https://test.ngrok-free.app',
        apiPrefix: '/api/v2',
        timeout: 20000,
        retryAttempts: 5,
        skipNgrokWarning: true,
        isNgrok: true,
        environment: expect.any(String)
      })
    })
  })

  describe('Edge cases', () => {
    it('debe manejar múltiples slashes consecutivos', () => {
      const config = ApiConfig.create({
        baseUrl: 'https://api.example.com/',
        apiPrefix: '//api//'
      })

      expect(config.baseUrl).toBe('https://api.example.com')
      expect(config.apiPrefix).toBe('/api')
    })

    it('debe manejar apiPrefix solo con slash', () => {
      const config = ApiConfig.create({
        apiPrefix: '/'
      })

      expect(config.apiPrefix).toBe('')
    })

    it('debe construir URL correcta con path raíz', () => {
      const config = ApiConfig.create({
        baseUrl: 'https://api.example.com',
        apiPrefix: '/api'
      })

      const url = config.buildUrl('/')
      expect(url).toBe('https://api.example.com/api/')
    })
  })
})
