/**
 * Servicio para Chatwoot Client API
 * Crea y actualiza contactos directamente en Chatwoot
 * 
 * Documentación: https://developers.chatwoot.com/docs/product/channels/api/client-apis
 */

import type { UTMParams } from '@/utils/utm'
import { logger } from '@/infrastructure/logging/logger'


/**
 * Request para crear contacto en Chatwoot
 */
interface ChatwootCreateContactRequest {
  identifier: string
  email: string
  name: string
  phone_number?: string
  custom_attributes: Record<string, string | number | boolean>
}

/**
 * Response de Chatwoot al crear contacto
 */
interface ChatwootContactResponse {
  contact: {
    id: number
    source_id: string
    name: string
    email: string
    phone_number?: string
    custom_attributes: Record<string, string | number | boolean>
  }
}

interface ChatwootErrorPayload {
  message?: string
  errors?: Record<string, unknown>
}

interface ChatwootContactPayload {
  id: number
  source_id?: string
  identifier?: string
  name: string
  email: string
  phone_number?: string
  custom_attributes?: Record<string, string | number | boolean>
}

interface ChatwootRawContactResponse {
  contact?: ChatwootContactPayload
  payload?: ChatwootContactPayload
}

interface ChatwootCreateContactBody {
  source_id: string
  email: string
  name: string
  phone_number?: string
  custom_attributes?: Record<string, string | number | boolean>
}

/**
 * Excepción para errores de Chatwoot API
 */
export class ChatwootException extends Error {
  constructor(
    public status: number,
    public errors: unknown,
    message: string
  ) {
    super(message)
    this.name = 'ChatwootException'
  }
}

/**
 * Servicio para interactuar con Chatwoot Client API
 */
export const chatwootClientService = {
  /**
   * Obtiene la URL base de Chatwoot desde env
   */
  getBaseUrl(): string {
    const baseUrl = import.meta.env.VITE_CHATWOOT_BASE_URL
    if (!baseUrl) {
      throw new Error('VITE_CHATWOOT_BASE_URL no configurada')
    }
    return baseUrl.replace(/\/$/, '') // Remove trailing slash
  },

  /**
   * Obtiene el identificador del inbox desde env
   */
  getInboxIdentifier(): string {
    const identifier = import.meta.env.VITE_CHATWOOT_INBOX_IDENTIFIER
    if (!identifier) {
      throw new Error('VITE_CHATWOOT_INBOX_IDENTIFIER no configurada')
    }
    return identifier
  },

  /**
   * Crea un contacto en Chatwoot
   * @param lead - Datos del lead (name, email, phone, etc.)
   * @param levelId - ID del nivel de contribución
   * @param utm - Parámetros UTM
   * @param consent - Datos de consentimiento
   * @returns Respuesta de Chatwoot con contact.id y contact.source_id
   */
  async createContact(
    lead: {
      name: string
      email: string
      phone?: string
      whatsapp?: string
      province?: string
      type?: string
      amount_range?: string
    },
    levelId: string,
    utm: UTMParams | Record<string, never> = {},
    consent: {
      version: string
      accepted_at: string
    }
  ): Promise<ChatwootContactResponse> {
    
    try {
      const baseUrl = this.getBaseUrl()
      const inboxIdentifier = this.getInboxIdentifier()

      // Generar identifier único
      const timestamp = Date.now()
      const uuid = crypto.randomUUID()
      const identifier = `lead_${uuid}_${timestamp}`

      // Construir custom attributes (aplanados) - solo valores no vacíos
      const customAttributes: Record<string, string | number | boolean> = {}
      
      // Agregar solo valores que existen
      if (levelId) customAttributes.level_id = levelId
      if (lead.amount_range) customAttributes.amount_range = lead.amount_range
      if (lead.type) customAttributes.type = lead.type
      if (lead.province) customAttributes.province = lead.province
      
      // UTM params
      const utmData = utm as UTMParams | Record<string, never>
      if (utmData?.utm_source) customAttributes.utm_source = utmData.utm_source
      if (utmData?.utm_medium) customAttributes.utm_medium = utmData.utm_medium
      if (utmData?.utm_campaign) customAttributes.utm_campaign = utmData.utm_campaign
      if (utmData?.utm_term) customAttributes.utm_term = utmData.utm_term
      if (utmData?.utm_content) customAttributes.utm_content = utmData.utm_content
      if (utmData?.campaign_id) customAttributes.campaign_id = utmData.campaign_id
      if (utmData?.referrer) customAttributes.referrer = utmData.referrer
      
      // Consent
      customAttributes.consent_version = consent.version
      customAttributes.consent_accepted_at = consent.accepted_at
      customAttributes.form_source = 'web_widget'

      // Construir request
      const request: ChatwootCreateContactBody = {
        source_id: identifier,
        email: lead.email,
        name: lead.name
      }

      // Agregar phone_number si está disponible
      if (lead.phone) {
        request.phone_number = lead.phone
      }

      // Agregar custom attributes solo si hay datos
      if (Object.keys(customAttributes).length > 0) {
        request.custom_attributes = customAttributes
      }

      // Hacer petición a Chatwoot
      const endpoint = `${baseUrl}/public/api/v1/inboxes/${inboxIdentifier}/contacts`
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        let error: ChatwootErrorPayload
        try {
          error = (await response.json()) as ChatwootErrorPayload
        } catch (parseError) {
          logger.event('error', {
            code: 'CHATWOOT_PARSE_ERROR_RESPONSE_FAILED',
            context: 'Failed to parse error response',
            safeDetails: { parseErrorType: parseError instanceof Error ? parseError.name : typeof parseError }
          })
          error = { message: response.statusText }
        }
        logger.event('error', {
          code: 'CHATWOOT_API_ERROR_RESPONSE',
          context: 'Chatwoot API error response',
          safeDetails: { status: response.status }
        })
        throw new ChatwootException(response.status, error, `Chatwoot API error: ${response.statusText}`)
      }

      let data: ChatwootRawContactResponse
      try {
        data = (await response.json()) as ChatwootRawContactResponse
      } catch (parseError) {
        logger.event('error', {
          code: 'CHATWOOT_PARSE_SUCCESS_RESPONSE_FAILED',
          context: 'Failed to parse success response',
          safeDetails: { parseErrorType: parseError instanceof Error ? parseError.name : typeof parseError }
        })
        throw new ChatwootException(500, {}, 'Invalid JSON response from Chatwoot')
      }

      // Verificar estructura de la respuesta
      if (!data || typeof data !== 'object') {
        logger.event('error', {
          code: 'CHATWOOT_INVALID_RESPONSE_STRUCTURE',
          context: 'Invalid response structure - not an object'
        })
        throw new ChatwootException(500, {}, 'Invalid response structure from Chatwoot')
      }

      // Chatwoot puede devolver diferentes estructuras según el endpoint
      // Intentar adaptarse a la estructura real
      const contact = data.contact ?? data.payload
      
      if (!contact) {
        logger.event('error', {
          code: 'CHATWOOT_MISSING_CONTACT_DATA',
          context: 'No contact data in response'
        })
        throw new ChatwootException(500, {}, 'No contact data in Chatwoot response')
      }

      // Loguear éxito
      // Normalizar respuesta
      return {
        contact: {
          id: contact.id,
          source_id: contact.source_id || contact.identifier,
          name: contact.name,
          email: contact.email,
          phone_number: contact.phone_number,
          custom_attributes: contact.custom_attributes || {}
        }
      }
    } catch (error) {
      if (error instanceof ChatwootException) {
        logger.event('error', {
          code: 'CHATWOOT_API_EXCEPTION',
          context: 'Chatwoot API exception',
          safeDetails: {
            status: error.status,
            message: error.message
          }
        })
        throw error
      }

      logger.event('error', {
        code: 'CHATWOOT_CREATE_CONTACT_UNEXPECTED_ERROR',
        context: 'Unexpected error creating contact',
        safeDetails: { errorType: error instanceof Error ? error.name : typeof error }
      })
      throw new ChatwootException(500, {}, `Error creating contact: ${(error as Error).message}`)
    }
  },

  /**
   * (Opcional) Actualiza custom attributes de un contacto existente
   * Nota: Chatwoot podría no soportar PATCH directo; se documentará cuando se confirme
   */
  async updateContactAttributes(
    sourceId: string,
    customAttributes: Record<string, string | number | boolean>
  ): Promise<ChatwootContactResponse> {
    try {
      const baseUrl = this.getBaseUrl()
      const inboxIdentifier = this.getInboxIdentifier()

      const endpoint = `${baseUrl}/public/api/v1/inboxes/${inboxIdentifier}/contacts/${sourceId}`
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ custom_attributes: customAttributes })
      })

      if (!response.ok) {
        const error = (await response.json()) as Record<string, unknown>
        throw new ChatwootException(response.status, error, `Chatwoot API error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      if (error instanceof ChatwootException) {
        throw error
      }

      logger.event('error', {
        code: 'CHATWOOT_UPDATE_CONTACT_FAILED',
        context: 'Error updating contact in Chatwoot',
        safeDetails: { errorType: error instanceof Error ? error.name : typeof error }
      })
      throw new ChatwootException(500, {}, `Error updating contact: ${(error as Error).message}`)
    }
  },

  /**
   * Envia un mensaje a Chatwoot
   * @param message - Mensaje a enviar
   */
  async sendMessage(message: string) {
    try {
      const baseUrl = this.getBaseUrl()
      const inboxIdentifier = this.getInboxIdentifier()

      const endpoint = `${baseUrl}/public/api/v1/inboxes/${inboxIdentifier}/messages`
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new ChatwootException(response.status, error, `Chatwoot API error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      logger.event('error', {
        code: 'CHATWOOT_SEND_MESSAGE_FAILED',
        context: 'Error enviando mensaje a Chatwoot',
        safeDetails: { errorType: error instanceof Error ? error.name : typeof error }
      })
      throw error
    }
  }
}
