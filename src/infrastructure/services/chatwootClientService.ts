/**
 * Servicio para Chatwoot Client API
 * Crea y actualiza contactos directamente en Chatwoot
 * 
 * Documentación: https://developers.chatwoot.com/docs/product/channels/api/client-apis
 */

import type { UTMParams } from '@/utils/utm'
import { Logger } from '@/infrastructure/logger'

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
    if (!hmacToken) {
      console.warn('[Chatwoot] HMAC token not configured - identifier_hash will not be sent')
      return undefined
    }

    try {
      // Usar crypto.subtle para HMAC SHA256 (Web Crypto API)
      const encoder = new TextEncoder()
      const data = encoder.encode(identifier)
      const key = encoder.encode(hmacToken)

      const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
      const signature = await crypto.subtle.sign('HMAC', cryptoKey, data)

      // Convertir a hex string
      const hash = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
      
      console.info('[Chatwoot] HMAC hash computed successfully')
      return hash
    } catch (error) {
      console.error('[Chatwoot] Error computing HMAC hash:', error)
      return undefined // No romper el flujo si falla HMAC
    }
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
    console.info('[Chatwoot] Creating contact:', { email: lead.email, name: lead.name })
    
    try {
      const baseUrl = this.getBaseUrl()
      const inboxIdentifier = this.getInboxIdentifier()
      const hmacToken = import.meta.env.VITE_CHATWOOT_HMAC_TOKEN

      console.info('[Chatwoot] Config:', { baseUrl, inboxIdentifier, hasHmacToken: !!hmacToken })

      // Generar identifier único
      const timestamp = Date.now()
      const uuid = crypto.randomUUID()
      const identifier = `lead_${uuid}_${timestamp}`

      console.info('[Chatwoot] Generated identifier:', identifier)

      // Calcular identifier_hash si está disponible
      const identifierHash = await this.computeIdentifierHash(identifier, hmacToken)

      // Construir custom attributes (aplanados) - solo valores no vacíos
      const customAttributes: Record<string, string | number | boolean> = {}
      
      // Agregar solo valores que existen
      if (levelId) customAttributes.level_id = levelId
      if (lead.amount_range) customAttributes.amount_range = lead.amount_range
      if (lead.type) customAttributes.type = lead.type
      if (lead.province) customAttributes.province = lead.province
      
      // UTM params
      const utmData = utm as any
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

      // Construir request (sin identifier_hash primero para debug)
      const request: any = {
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

      console.info('[Chatwoot] Request payload:', JSON.stringify(request, null, 2))

      // Hacer petición a Chatwoot
      const endpoint = `${baseUrl}/public/api/v1/inboxes/${inboxIdentifier}/contacts`
      console.info('[Chatwoot] Sending POST to:', endpoint)
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      })

      console.info('[Chatwoot] Response status:', response.status, response.statusText)

      if (!response.ok) {
        let error
        try {
          error = await response.json()
        } catch (parseError) {
          console.error('[Chatwoot] Failed to parse error response:', parseError)
          error = { message: response.statusText }
        }
        console.error('[Chatwoot] API error response:', error)
        throw new ChatwootException(response.status, error, `Chatwoot API error: ${response.statusText}`)
      }

      let data: ChatwootContactResponse
      try {
        data = await response.json()
        console.info('[Chatwoot] Raw response data:', JSON.stringify(data, null, 2))
      } catch (parseError) {
        console.error('[Chatwoot] Failed to parse success response:', parseError)
        throw new ChatwootException(500, {}, 'Invalid JSON response from Chatwoot')
      }

      // Verificar estructura de la respuesta
      if (!data || typeof data !== 'object') {
        console.error('[Chatwoot] Invalid response structure - not an object:', data)
        throw new ChatwootException(500, {}, 'Invalid response structure from Chatwoot')
      }

      // Chatwoot puede devolver diferentes estructuras según el endpoint
      // Intentar adaptarse a la estructura real
      const contact = (data as any).contact || (data as any).payload || data
      
      if (!contact) {
        console.error('[Chatwoot] No contact data in response:', data)
        throw new ChatwootException(500, {}, 'No contact data in Chatwoot response')
      }

      // Loguear éxito
      console.info('[Chatwoot] ✅ Contact created successfully:', {
        contact_id: contact.id,
        source_id: contact.source_id || contact.identifier,
        identifier,
        full_contact: contact
      })

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
        console.error('[Chatwoot] ❌ API error:', {
          status: error.status,
          errors: error.errors,
          message: error.message
        })
        throw error
      }

      console.error('[Chatwoot] ❌ Unexpected error creating contact:', error)
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
      Logger.error('Error enviando mensaje a Chatwoot', error)
      throw error
    }
  }
}
