/**
 * Tests para ResponseValidator
 * 
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { ResponseValidator, ResponseValidationError } from '../ResponseValidator'

describe('ResponseValidator', () => {
  let validator: ResponseValidator

  beforeEach(() => {
    validator = new ResponseValidator('application/json')
  })

  describe('validate()', () => {
    it('debe pasar validación cuando content-type es application/json', async () => {
      const mockResponse = new Response(JSON.stringify({ data: 'test' }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      })

      await expect(
        validator.validate(mockResponse, 'https://api.test.com/data', 'req_123')
      ).resolves.toBeUndefined()
    })

    it('debe pasar validación cuando content-type incluye charset', async () => {
      const mockResponse = new Response(JSON.stringify({ data: 'test' }), {
        status: 200,
        headers: { 'content-type': 'application/json; charset=utf-8' }
      })

      await expect(
        validator.validate(mockResponse, 'https://api.test.com/data', 'req_123')
      ).resolves.toBeUndefined()
    })

    it('debe lanzar error cuando content-type es text/html', async () => {
      const htmlBody = '<html><head><title>Test Page</title></head><body>Content</body></html>'
      const mockResponse = new Response(htmlBody, {
        status: 200,
        headers: { 'content-type': 'text/html' }
      })

      await expect(
        validator.validate(mockResponse, 'https://api.test.com/data', 'req_123')
      ).rejects.toThrow(ResponseValidationError)
    })

    it('debe detectar intersticial de ngrok', async () => {
      const ngrokHtml = `
        <html>
          <head><title>ngrok</title></head>
          <body>
            <p>You are about to visit ngrok.io, served by...</p>
          </body>
        </html>
      `
      const mockResponse = new Response(ngrokHtml, {
        status: 200,
        headers: { 
          'content-type': 'text/html',
          'content-security-policy': 'default-src cdn.ngrok.com'
        }
      })

      try {
        await validator.validate(mockResponse, 'https://test.ngrok-free.app/api/data', 'req_123')
        expect.fail('Should have thrown error')
      } catch (error) {
        expect(error).toBeInstanceOf(ResponseValidationError)
        const validationError = (error as ResponseValidationError).validationError
        expect(validationError.message).toContain('ngrok')
        expect(validationError.message).toContain('ngrok-skip-browser-warning')
        expect(validationError.details.bodyPreview).toContain('ngrok')
      }
    })

    it('debe detectar página 404', async () => {
      const html404 = `
        <html>
          <head><title>404 Not Found</title></head>
          <body><h1>404 - Page Not Found</h1></body>
        </html>
      `
      const mockResponse = new Response(html404, {
        status: 404,
        headers: { 'content-type': 'text/html' }
      })

      try {
        await validator.validate(mockResponse, 'https://api.test.com/wrong-path', 'req_123')
        expect.fail('Should have thrown error')
      } catch (error) {
        expect(error).toBeInstanceOf(ResponseValidationError)
        const validationError = (error as ResponseValidationError).validationError
        expect(validationError.message).toContain('404')
        expect(validationError.details.status).toBe(404)
      }
    })

    it('debe capturar título HTML en el preview', async () => {
      const htmlWithTitle = '<html><head><title>Error Page</title></head><body>Error</body></html>'
      const mockResponse = new Response(htmlWithTitle, {
        status: 200,
        headers: { 'content-type': 'text/html' }
      })

      try {
        await validator.validate(mockResponse, 'https://api.test.com/data', 'req_123')
        expect.fail('Should have thrown error')
      } catch (error) {
        const validationError = (error as ResponseValidationError).validationError
        expect(validationError.details.bodyPreview).toContain('HTML Title: Error Page')
      }
    })

    it('debe capturar headers relevantes', async () => {
      const mockResponse = new Response('<html></html>', {
        status: 200,
        headers: {
          'content-type': 'text/html',
          'content-security-policy': 'default-src self',
          'x-frame-options': 'DENY',
          'server': 'nginx'
        }
      })

      try {
        await validator.validate(mockResponse, 'https://api.test.com/data', 'req_123')
        expect.fail('Should have thrown error')
      } catch (error) {
        const validationError = (error as ResponseValidationError).validationError
        expect(validationError.details.headers).toBeDefined()
        expect(validationError.details.headers!['content-security-policy']).toBe('default-src self')
        expect(validationError.details.headers!['x-frame-options']).toBe('DENY')
        expect(validationError.details.headers!['server']).toBe('nginx')
      }
    })

    it('debe incluir requestId y timestamp en error', async () => {
      const mockResponse = new Response('<html></html>', {
        status: 200,
        headers: { 'content-type': 'text/html' }
      })

      try {
        await validator.validate(mockResponse, 'https://api.test.com/data', 'req_xyz_789')
        expect.fail('Should have thrown error')
      } catch (error) {
        const validationError = (error as ResponseValidationError).validationError
        expect(validationError.details.requestId).toBe('req_xyz_789')
        expect(validationError.details.timestamp).toBeDefined()
        expect(new Date(validationError.details.timestamp).getTime()).toBeGreaterThan(0)
      }
    })

    it('debe truncar body largo en preview', async () => {
      const longHtml = '<html><body>' + 'x'.repeat(1000) + '</body></html>'
      const mockResponse = new Response(longHtml, {
        status: 200,
        headers: { 'content-type': 'text/html' }
      })

      try {
        await validator.validate(mockResponse, 'https://api.test.com/data', 'req_123')
        expect.fail('Should have thrown error')
      } catch (error) {
        const validationError = (error as ResponseValidationError).validationError
        expect(validationError.details.bodyPreview!.length).toBeLessThan(1000)
        expect(validationError.details.bodyPreview).toContain('...')
        expect(validationError.details.bodyLength).toBe(longHtml.length)
      }
    })

    it('debe manejar error al leer body', async () => {
      // Mock de Response que falla al leer el body
      const mockResponse = {
        status: 200,
        headers: {
          get: (name: string) => (name === 'content-type' ? 'text/html' : null)
        },
        clone: () => ({
          text: () => Promise.reject(new Error('Failed to read body'))
        })
      } as unknown as Response

      try {
        await validator.validate(mockResponse, 'https://api.test.com/data', 'req_123')
        expect.fail('Should have thrown error')
      } catch (error) {
        expect(error).toBeInstanceOf(ResponseValidationError)
        const validationError = (error as ResponseValidationError).validationError
        expect(validationError.details.bodyPreview).toBe('')
        expect(validationError.details.bodyLength).toBe(0)
      }
    })

    it('debe validar content-type vacío como inválido', async () => {
      const mockResponse = new Response('{}', {
        status: 200,
        headers: {} // Sin content-type
      })

      await expect(
        validator.validate(mockResponse, 'https://api.test.com/data', 'req_123')
      ).rejects.toThrow(ResponseValidationError)
    })
  })

  describe('Validadores específicos', () => {
    it('debe validar text/plain cuando se configura para texto', async () => {
      const textValidator = new ResponseValidator('text/plain')
      const mockResponse = new Response('plain text content', {
        status: 200,
        headers: { 'content-type': 'text/plain' }
      })

      await expect(
        textValidator.validate(mockResponse, 'https://api.test.com/data', 'req_123')
      ).resolves.toBeUndefined()
    })

    it('debe rechazar application/json cuando se espera text/plain', async () => {
      const textValidator = new ResponseValidator('text/plain')
      const mockResponse = new Response(JSON.stringify({ data: 'test' }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      })

      await expect(
        textValidator.validate(mockResponse, 'https://api.test.com/data', 'req_123')
      ).rejects.toThrow(ResponseValidationError)
    })
  })

  describe('Error structure', () => {
    it('debe tener estructura de error correcta', async () => {
      const mockResponse = new Response('<html></html>', {
        status: 200,
        headers: { 'content-type': 'text/html' }
      })

      try {
        await validator.validate(mockResponse, 'https://api.test.com/endpoint', 'req_123')
        expect.fail('Should have thrown error')
      } catch (error) {
        expect(error).toBeInstanceOf(ResponseValidationError)
        const validationError = (error as ResponseValidationError).validationError
        
        // Verificar estructura del error
        expect(validationError).toHaveProperty('type')
        expect(validationError).toHaveProperty('message')
        expect(validationError).toHaveProperty('details')
        
        // Verificar detalles
        expect(validationError.details.url).toBe('https://api.test.com/endpoint')
        expect(validationError.details.status).toBe(200)
        expect(validationError.details.contentType).toBe('text/html')
        expect(validationError.details.expectedContentType).toBe('application/json')
        expect(validationError.details.requestId).toBe('req_123')
      }
    })
  })
})
