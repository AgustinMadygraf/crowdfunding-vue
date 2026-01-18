/**
 * Tests para HttpClient
 * 
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'
import { HttpClient, HttpClientError } from '../HttpClient'
import { ApiConfig } from '../ApiConfig'
import { ResponseValidator, ResponseValidationError } from '../ResponseValidator'

// Mock de fetch
global.fetch = vi.fn() as Mock

describe('HttpClient', () => {
  let config: ApiConfig
  let client: HttpClient
  let mockFetch: Mock

  beforeEach(() => {
    config = ApiConfig.create({
      baseUrl: 'https://api.test.com',
      apiPrefix: '/api',
      timeout: 5000,
      retryAttempts: 1,
      skipNgrokWarning: false
    })
    
    client = new HttpClient({ config })
    mockFetch = global.fetch as Mock
    vi.clearAllMocks()
  })

  describe('GET requests', () => {
    it('debe ejecutar GET exitoso', async () => {
      const mockData = { id: 1, name: 'Test' }
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify(mockData), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        })
      )

      const result = await client.get<typeof mockData>('/users/1')

      expect(result).toEqual(mockData)
      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/users/1',
        expect.objectContaining({
          method: 'GET',
          credentials: 'include'
        })
      )
    })

    it('debe incluir X-Request-Id en headers', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({}), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        })
      )

      await client.get('/test')

      const callArgs = (mockFetch as any).mock.calls[0]
      const headers = callArgs[1].headers as Record<string, string>
      expect(headers['X-Request-Id']).toMatch(/^req_\d+_[a-z0-9]+$/)
    })

    it('debe agregar header ngrok-skip-browser-warning cuando esté configurado', async () => {
      const ngrokConfig = ApiConfig.create({
        baseUrl: 'https://test.ngrok-free.app',
        skipNgrokWarning: true
      })
      const ngrokClient = new HttpClient({ config: ngrokConfig })

      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({}), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        })
      )

      await ngrokClient.get('/test')

      const callArgs = (mockFetch as any).mock.calls[0]
      const headers = callArgs[1].headers as Record<string, string>
      expect(headers['ngrok-skip-browser-warning']).toBe('true')
    })
  })

  describe('POST requests', () => {
    it('debe ejecutar POST con body JSON', async () => {
      const requestBody = { name: 'New Item' }
      const responseData = { id: 123, ...requestBody }
      
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify(responseData), {
          status: 201,
          headers: { 'content-type': 'application/json' }
        })
      )

      const result = await client.post('/items', requestBody)

      expect(result).toEqual(responseData)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/items',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestBody)
        })
      )
    })
  })

  describe('Error handling', () => {
    it('debe lanzar HttpClientError en error 404', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Not Found' }), {
          status: 404,
          headers: { 'content-type': 'application/json' }
        })
      )

      await expect(client.get('/not-found')).rejects.toThrow(HttpClientError)
    })

    it('debe lanzar ResponseValidationError cuando llega HTML', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response('<html><body>Error</body></html>', {
          status: 200,
          headers: { 'content-type': 'text/html' }
        })
      )

      await expect(client.get('/endpoint')).rejects.toThrow(ResponseValidationError)
    })

    it('debe manejar timeout', async () => {
      const shortTimeoutConfig = ApiConfig.create({
        baseUrl: 'https://api.test.com',
        timeout: 100
      })
      const shortClient = new HttpClient({ config: shortTimeoutConfig })

      mockFetch.mockImplementationOnce(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      )

      await expect(shortClient.get('/slow')).rejects.toThrow(HttpClientError)
    })

    it('debe incluir detalles del error en HttpClientError', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Validation failed', errors: { name: ['Required'] } }), {
          status: 422,
          headers: { 'content-type': 'application/json' }
        })
      )

      try {
        await client.get('/validate')
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(HttpClientError)
        const httpError = (error as HttpClientError).httpError
        expect(httpError.status).toBe(422)
        expect(httpError.message).toBe('Validation failed')
        expect(httpError.errors).toEqual({ name: ['Required'] })
      }
    })
  })

  describe('204 No Content', () => {
    it('debe retornar null en 204', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(null, {
          status: 204,
          headers: { 'content-type': 'application/json' }
        })
      )

      const result = await client.delete('/items/123')
      expect(result).toBeNull()
    })
  })

  describe('Retry logic', () => {
    it('NO debe reintentar en error 4xx', async () => {
      const retryConfig = ApiConfig.create({
        baseUrl: 'https://api.test.com',
        retryAttempts: 3
      })
      const retryClient = new HttpClient({ config: retryConfig })

      mockFetch.mockResolvedValue(
        new Response(JSON.stringify({ message: 'Bad Request' }), {
          status: 400,
          headers: { 'content-type': 'application/json' }
        })
      )

      await expect(retryClient.get('/endpoint')).rejects.toThrow(HttpClientError)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('NO debe reintentar en ResponseValidationError', async () => {
      const retryConfig = ApiConfig.create({
        baseUrl: 'https://api.test.com',
        retryAttempts: 3
      })
      const retryClient = new HttpClient({ config: retryConfig })

      mockFetch.mockResolvedValue(
        new Response('<html>Error</html>', {
          status: 200,
          headers: { 'content-type': 'text/html' }
        })
      )

      await expect(retryClient.get('/endpoint')).rejects.toThrow(ResponseValidationError)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('Custom headers', () => {
    it('debe incluir headers adicionales', async () => {
      const clientWithHeaders = new HttpClient({
        config,
        additionalHeaders: {
          'Authorization': 'Bearer token123',
          'X-Custom': 'value'
        }
      })

      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({}), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        })
      )

      await clientWithHeaders.get('/protected')

      const callArgs = (mockFetch as any).mock.calls[0]
      const headers = callArgs[1].headers as Record<string, string>
      expect(headers['Authorization']).toBe('Bearer token123')
      expect(headers['X-Custom']).toBe('value')
    })

    it('custom headers deben sobrescribir defaults', async () => {
      const clientWithHeaders = new HttpClient({
        config,
        additionalHeaders: { 'Accept': 'application/xml' }
      })

      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({}), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        })
      )

      await clientWithHeaders.get('/endpoint')

      const callArgs = (mockFetch as any).mock.calls[0]
      const headers = callArgs[1].headers as Record<string, string>
      expect(headers['Accept']).toBe('application/xml')
    })
  })

  describe('HTTP Methods', () => {
    it('debe soportar PUT', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ updated: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        })
      )

      await client.put('/items/1', { name: 'Updated' })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/items/1',
        expect.objectContaining({ method: 'PUT' })
      )
    })

    it('debe soportar PATCH', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ patched: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        })
      )

      await client.patch('/items/1', { name: 'Patched' })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/items/1',
        expect.objectContaining({ method: 'PATCH' })
      )
    })

    it('debe soportar DELETE', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(null, {
          status: 204,
          headers: { 'content-type': 'application/json' }
        })
      )

      await client.delete('/items/1')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/items/1',
        expect.objectContaining({ method: 'DELETE' })
      )
    })
  })
})
