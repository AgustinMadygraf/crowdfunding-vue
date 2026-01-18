/**
 * ResponseValidator - Validación de respuestas HTTP
 * Responsabilidad única: validar content-type y formato de respuesta
 * 
 * @module ResponseValidator
 */

export interface ValidationError {
  type: 'invalid_content_type' | 'invalid_json' | 'empty_response'
  message: string
  details: ValidationErrorDetails
}

export interface ValidationErrorDetails {
  url: string
  status: number
  contentType: string
  expectedContentType: string
  bodyPreview?: string
  bodyLength?: number
  headers?: Record<string, string>
  requestId?: string
  timestamp: string
}

export class ResponseValidationError extends Error {
  constructor(
    public readonly validationError: ValidationError
  ) {
    super(validationError.message)
    this.name = 'ResponseValidationError'
    
    // Mantener stack trace en V8
    if ((Error as any).captureStackTrace) {
      (Error as any).captureStackTrace(this, ResponseValidationError)
    }
  }
}

/**
 * Valida que una respuesta HTTP tenga el content-type esperado
 */
export class ResponseValidator {
  private readonly expectedContentType: string

  constructor(expectedContentType: string = 'application/json') {
    this.expectedContentType = expectedContentType
  }

  /**
   * Valida content-type de la respuesta
   * Si llega HTML cuando se espera JSON, captura detalles para diagnóstico
   */
  async validate(response: Response, requestUrl: string, requestId?: string): Promise<void> {
    const contentType = response.headers.get('content-type') || ''
    
    // Validar que el content-type sea el esperado
    if (!this.isContentTypeValid(contentType)) {
      const error = await this.buildValidationError(
        response,
        requestUrl,
        contentType,
        requestId
      )
      throw new ResponseValidationError(error)
    }
  }

  /**
   * Verifica si el content-type es válido
   */
  private isContentTypeValid(contentType: string): boolean {
    return contentType.includes(this.expectedContentType)
  }

  /**
   * Construye un error enriquecido con detalles de la respuesta
   */
  private async buildValidationError(
    response: Response,
    requestUrl: string,
    actualContentType: string,
    requestId?: string
  ): Promise<ValidationError> {
    // Capturar snippet del body para diagnóstico
    const bodyText = await this.safeReadBody(response)
    const bodyPreview = this.extractBodyPreview(bodyText, actualContentType)
    
    // Capturar headers relevantes
    const relevantHeaders = this.extractRelevantHeaders(response)

    const details: ValidationErrorDetails = {
      url: requestUrl,
      status: response.status,
      contentType: actualContentType,
      expectedContentType: this.expectedContentType,
      bodyPreview,
      bodyLength: bodyText.length,
      headers: relevantHeaders,
      requestId,
      timestamp: new Date().toISOString()
    }

    // Mensaje específico según el tipo de content-type recibido
    const message = this.buildErrorMessage(actualContentType, requestUrl, bodyPreview)

    return {
      type: 'invalid_content_type',
      message,
      details
    }
  }

  /**
   * Lee el body de forma segura sin lanzar excepciones
   */
  private async safeReadBody(response: Response): Promise<string> {
    try {
      // Clonar la respuesta para no consumir el body original
      return await response.clone().text()
    } catch (error) {
      console.error('[ResponseValidator] Error reading response body:', error)
      return ''
    }
  }

  /**
   * Extrae un preview del body según el content-type
   */
  private extractBodyPreview(body: string, contentType: string): string {
    const maxLength = 500
    
    if (contentType.includes('text/html')) {
      // Para HTML, intentar extraer el título
      const titleMatch = body.match(/<title>([^<]*)<\/title>/i)
      const title = titleMatch ? `HTML Title: ${titleMatch[1].trim()}` : ''
      
      // Extraer meta tags relevantes
      const metaMatch = body.match(/<meta[^>]+name="description"[^>]*content="([^"]*)"[^>]*>/i)
      const description = metaMatch ? `\nMeta: ${metaMatch[1]}` : ''
      
      const preview = body.slice(0, maxLength)
      return `${title}${description}\n\nPreview:\n${preview}${body.length > maxLength ? '...' : ''}`
    }
    
    // Para otros tipos, simplemente truncar
    return body.slice(0, maxLength) + (body.length > maxLength ? '...' : '')
  }

  /**
   * Extrae headers relevantes para diagnóstico
   */
  private extractRelevantHeaders(response: Response): Record<string, string> {
    const relevantHeaderNames = [
      'content-security-policy',
      'x-frame-options',
      'location',
      'server',
      'x-powered-by',
      'access-control-allow-origin'
    ]

    const headers: Record<string, string> = {}
    
    relevantHeaderNames.forEach(name => {
      const value = response.headers.get(name)
      if (value) {
        headers[name] = value
      }
    })

    return headers
  }

  /**
   * Construye mensaje de error específico según el contexto
   */
  private buildErrorMessage(
    actualContentType: string,
    url: string,
    bodyPreview: string
  ): string {
    if (actualContentType.includes('text/html')) {
      // Detectar casos comunes
      if (bodyPreview.includes('ngrok')) {
        return `Ngrok intersticial detectado. El endpoint devolvió HTML en lugar de JSON. ` +
               `Agrega el header 'ngrok-skip-browser-warning' para evitar la página de advertencia de ngrok.`
      }
      
      if (bodyPreview.includes('404') || bodyPreview.includes('Not Found')) {
        return `Página 404 devuelta. El endpoint '${url}' no existe o la ruta es incorrecta. ` +
               `Verifica VITE_API_BASE_URL y los prefijos de ruta.`
      }
      
      if (bodyPreview.includes('500') || bodyPreview.includes('Internal Server Error')) {
        return `Error 500 del servidor. El backend devolvió una página HTML de error en lugar de JSON.`
      }

      return `Respuesta HTML inesperada del endpoint. Se esperaba ${this.expectedContentType} pero se recibió ${actualContentType}. ` +
             `Esto puede indicar un problema de configuración de URL o proxy.`
    }

    return `Content-Type inválido. Se esperaba ${this.expectedContentType} pero se recibió ${actualContentType}.`
  }
}

/**
 * Factory para crear validadores con configuración específica
 */
export const createJsonValidator = (): ResponseValidator => {
  return new ResponseValidator('application/json')
}

export const createTextValidator = (): ResponseValidator => {
  return new ResponseValidator('text/plain')
}
