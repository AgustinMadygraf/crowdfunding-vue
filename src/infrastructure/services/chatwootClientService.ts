/**
 * Servicio para Chatwoot Client API
 * Crea y actualiza contactos directamente en Chatwoot
 * 
 * Documentación: https://developers.chatwoot.com/docs/product/channels/api/client-apis
 */

import type { UTMParams } from '@/utils/utm'

/**
 * Request para crear contacto en Chatwoot
 */
interface ChatwootCreateContactRequest {
  identifier: string
  identifier_hash?: string
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
    custom_attributes: Record<string, any>
  }
}

/**
 * Excepción para errores de Chatwoot API
 */
export class ChatwootException extends Error {
  constructor(
    public status: number,
    public errors: Record<string, any>,
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
   * Calcula el HMAC SHA256 para validación de identidad
   * @param identifier - ID único del contacto
   * @param hmacToken - Token HMAC del inbox (opcional)
   * @returns Hash HMAC SHA256 o undefined si no hay token
   */
  async computeIdentifierHash(
    identifier: string,
    hmacToken?: string
  ): Promise<string | undefined> {
    if (!hmacToken) return undefined

    // Usar crypto.subtle para HMAC SHA256 (Web Crypto API)
    const encoder = new TextEncoder()
    const data = encoder.encode(identifier)
    const key = encoder.encode(hmacToken)

    const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, data)

    // Convertir a hex string
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
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
      const hmacToken = import.meta.env.VITE_CHATWOOT_HMAC_TOKEN

      // Generar identifier único
      const timestamp = Date.now()
      const uuid = crypto.randomUUID()
      const identifier = `lead_${uuid}_${timestamp}`

      // Calcular identifier_hash si está disponible
      const identifierHash = await this.computeIdentifierHash(identifier, hmacToken)

      // Construir custom attributes (aplanados)
      const customAttributes: Record<string, string | number | boolean> = {
        form_source: 'web_widget',
        level_id: levelId,
        amount_range: lead.amount_range || '',
        type: lead.type || '',
        province: lead.province || '',
        utm_source: (utm as any)?.utm_source || '',
        utm_medium: (utm as any)?.utm_medium || '',
        utm_campaign: (utm as any)?.utm_campaign || '',
        utm_term: (utm as any)?.utm_term || '',
        utm_content: (utm as any)?.utm_content || '',
        campaign_id: (utm as any)?.campaign_id || '',
        referrer: (utm as any)?.referrer || '',
        consent_version: consent.version,
        consent_accepted_at: consent.accepted_at
      }

      // Construir request
      const request: ChatwootCreateContactRequest = {
        identifier,
        email: lead.email,
        name: lead.name,
        custom_attributes: customAttributes
      }

      // Agregar phone_number si está disponible
      if (lead.phone) {
        request.phone_number = lead.phone
      }

      // Agregar identifier_hash si está disponible
      if (identifierHash) {
        request.identifier_hash = identifierHash
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
        const error = await response.json()
        throw new ChatwootException(response.status, error, `Chatwoot API error: ${response.statusText}`)
      }

      const data: ChatwootContactResponse = await response.json()

      // Loguear éxito
      console.log('Contact created in Chatwoot:', {
        contact_id: data.contact.id,
        source_id: data.contact.source_id,
        identifier
      })

      return data
    } catch (error) {
      if (error instanceof ChatwootException) {
        console.error('Chatwoot API error:', error.status, error.errors)
        throw error
      }

      console.error('Error creating contact in Chatwoot:', error)
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
        const error = await response.json()
        throw new ChatwootException(response.status, error, `Chatwoot API error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      if (error instanceof ChatwootException) {
        throw error
      }

      console.error('Error updating contact in Chatwoot:', error)
      throw new ChatwootException(500, {}, `Error updating contact: ${(error as Error).message}`)
    }
  }
}
