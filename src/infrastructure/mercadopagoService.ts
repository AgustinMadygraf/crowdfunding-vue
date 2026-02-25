/**
 * MercadoPago Service
 * Handles payment integration with MercadoPago Checkout Pro
 */

import { loadMercadoPago } from '@mercadopago/sdk-js'
import { getAppConfig } from '@/config/appConfig'
import { csrfService } from '@/infrastructure/services/csrfService'
import { logger } from '@/infrastructure/logging/logger'

interface MercadoPagoCheckout {
  on: (eventName: string, callback: () => void) => void
}

interface MercadoPagoInstance {
  checkout: (config: { preference: { id: string }; autoOpen: boolean }) => MercadoPagoCheckout
}

interface MercadoPagoConstructor {
  new (publicKey: string, options: { locale: string }): MercadoPagoInstance
}

interface MercadoPagoWindow extends Window {
  MercadoPago?: MercadoPagoConstructor
}

interface PaymentPreferenceResponse {
  preference_id?: string
  preferenceId?: string
  message?: string
  error?: string
}

// MercadoPago SDK instance (loaded asynchronously)
let mp: MercadoPagoInstance | null = null
let mpInitialized = false

/**
 * Initialize MercadoPago SDK
 * Must be called before using payment features
 */
export async function initMercadoPago(): Promise<void> {
  if (mpInitialized) {
    return
  }

  const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY

  // Validar que la clave pública esté configurada
  if (!publicKey) {
    const errorMsg = '❌ VITE_MERCADOPAGO_PUBLIC_KEY no está configurada'
    logger.error(`[MercadoPago] ${errorMsg}`)
    logger.warn('[MercadoPago] ⚠️ Pasos para configurar:')
    logger.warn('  1️⃣ Ve a https://www.mercadopago.com.ar/developers/panel/app')
    logger.warn('  2️⃣ Crea una aplicación')
    logger.warn('  3️⃣ Copia la "Public Key"')
    logger.warn('  4️⃣ Agrega en .env: VITE_MERCADOPAGO_PUBLIC_KEY=tu_public_key')
    logger.warn('[MercadoPago] 💡 Para testing: usa claves de prueba (TEST-...)')
    logger.warn('[MercadoPago] Pagos deshabilitados hasta configurar esta clave')
    return
  }

  if (publicKey.includes('%VITE_') || publicKey.includes('your_public_key')) {
    const errorMsg = '❌ VITE_MERCADOPAGO_PUBLIC_KEY es un placeholder'
    logger.error(`[MercadoPago] ${errorMsg}`)
    logger.error('[MercadoPago] Valor actual:', publicKey)
    logger.warn('[MercadoPago] ⚠️ Clave no válida - reemplaza con tu Public Key real')
    logger.warn('[MercadoPago] Pagos deshabilitados')
    return
  }

  try {
    await loadMercadoPago()

    try {
      const mercadoPagoConstructor = (window as MercadoPagoWindow).MercadoPago
      if (!mercadoPagoConstructor) {
        throw new Error('SDK de Mercado Pago no disponible en window')
      }
      mp = new mercadoPagoConstructor(publicKey, {
        locale: 'es-AR'
      })
      mpInitialized = true
    } catch (initError) {
      logger.error('[MercadoPago] ❌ Error al inicializar instancia:', initError)
      logger.error('[MercadoPago] Stack:', initError instanceof Error ? initError.stack : 'No disponible')
      logger.warn('[MercadoPago] Posibles causas:')
      logger.warn('  1️⃣ Public Key inválida o expirada')
      logger.warn('  2️⃣ SDK no cargó correctamente')
      logger.warn('  3️⃣ Problema de conexión a mercadopago.com')
      throw initError
    }
  } catch (error) {
    logger.error('[MercadoPago] ❌ Error al cargar SDK:', error)
    logger.error('[MercadoPago] Mensaje:', error instanceof Error ? error.message : 'Error desconocido')
    logger.error('[MercadoPago] Stack:', error instanceof Error ? error.stack : 'No disponible')
    logger.warn('[MercadoPago] ⚠️ Soluciones:')
    logger.warn('  1️⃣ Verifica tu conexión a internet')
    logger.warn('  2️⃣ Verifica que no hay bloqueador de scripts')
    logger.warn('  3️⃣ Recarga la página')
    throw error
  }
}

/**
 * Create payment preference via backend API
 * Returns preference_id to open Checkout Pro
 */
export async function createPaymentPreference(data: {
  contact_id: string
  level_id: number
  level_name: string
  amount: number
  payer_email: string
  payer_name: string
}): Promise<{ preference_id: string }> {
  const apiUrl = getAppConfig().apiBaseUrl
  const csrfToken = csrfService.getToken()
  try {
    // Validar que contacto_id esté disponible
    if (!data.contact_id) {
      throw new Error('contact_id es requerido para crear la preferencia')
    }
    
    const response = await fetch(`${apiUrl}/api/payments/mercadopago/preference`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken ? csrfService.getTokenHeader(csrfToken, 'X-CSRF-Token') : {})
      },
      body: JSON.stringify({
        amount: data.amount,
        currency: 'ARS',
        description: `Contribucion ${data.level_name} - Proyecto RKHA190`,
        referenceId: `contribution_${data.contact_id}_${data.level_id}`,
        payer: {
          email: data.payer_email,
          name: data.payer_name
        }
      })
    }).catch((fetchError) => {
      logger.error('[MercadoPago] ❌ Error de conexión:', fetchError)
      logger.error('[MercadoPago] 🌐 URL del servidor:', apiUrl)
      logger.error('[MercadoPago] Mensaje:', fetchError instanceof Error ? fetchError.message : 'Error desconocido')
      logger.warn('[MercadoPago] ⚠️ Posibles causas:')
      logger.warn('  1️⃣ Servidor no está ejecutándose')
      logger.warn('  2️⃣ URL del servidor es incorrecta')
      logger.warn('  3️⃣ Problemas de red/conectividad')
      throw new Error(`No se pudo conectar al servidor: ${fetchError instanceof Error ? fetchError.message : 'Error desconocido'}`)
    })

    if (!response.ok) {
      logger.error(`[MercadoPago] ❌ Respuesta del servidor: HTTP ${response.status} ${response.statusText}`)
      
      let errorData: PaymentPreferenceResponse = {}
      try {
        errorData = await response.json()
        logger.error('[MercadoPago] 📋 Respuesta del servidor:', errorData)
      } catch (parseErr) {
        logger.warn('[MercadoPago] ⚠️ No se pudo parsear respuesta de error')
        const text = await response.text()
        logger.error('[MercadoPago] Contenido:', text)
      }

      const errorMsg = errorData.message || errorData.error || `HTTP ${response.status}`
      logger.error('[MercadoPago] 💬 Mensaje de error:', errorMsg)
      logger.warn('[MercadoPago] ⚠️ Soluciones:')
      logger.warn('  1️⃣ Verifica que el backend está ejecutándose')
      logger.warn('  2️⃣ Verifica la URL en VITE_API_BASE_URL')
      logger.warn('  3️⃣ Verifica CORS en el backend')
      throw new Error(errorMsg)
    }

    let result: PaymentPreferenceResponse
    try {
      result = await response.json()
      if (result && !result.preference_id && result.preferenceId) {
        result.preference_id = result.preferenceId
      }
    } catch (parseError) {
      logger.error('[MercadoPago] ❌ Error al parsear respuesta JSON:', parseError)
      logger.error('[MercadoPago] Stack:', parseError instanceof Error ? parseError.stack : 'No disponible')
      throw new Error('Respuesta inválida del servidor')
    }
    
    const preferenceId = result.preference_id ?? result.preferenceId
    if (!preferenceId) {
      throw new Error('No se recibió preference_id válido del servidor')
    }
    return { preference_id: preferenceId }
  } catch (error) {
    logger.error('[MercadoPago] ❌ Error al crear preferencia:', error)
    logger.error('[MercadoPago] Tipo de error:', typeof error)
    logger.error('[MercadoPago] Detalles:', error instanceof Error ? error.message : error)
    throw error
  }
}

/**
 * Open MercadoPago Checkout Pro modal
 */
export async function openCheckout(preferenceId: string): Promise<void> {

  if (!mpInitialized || !mp) {
    const errorMsg = 'SDK de Mercado Pago no está inicializado'
    logger.error(`[MercadoPago] ❌ ${errorMsg}`)
    logger.error('[MercadoPago] mpInitialized:', mpInitialized)
    logger.error('[MercadoPago] mp:', !!mp)
    logger.warn('[MercadoPago] ⚠️ Llama a initMercadoPago() antes de openCheckout()')
    throw new Error(errorMsg)
  }

  try {
    
    // Create checkout instance
    const checkout = mp.checkout({
      preference: {
        id: preferenceId
      },
      autoOpen: true // Open modal automatically
    })

    // Optional: listen to checkout events
    try {
      checkout.on('submit', () => {
      })
    } catch (eventError) {
      logger.warn('[MercadoPago] ⚠️ Error al configurar event listeners:', eventError)
      // No es crítico, continuamos
    }

  } catch (error) {
    logger.error('[MercadoPago] ❌ Error al abrir checkout:', error)
    logger.error('[MercadoPago] Mensaje:', error instanceof Error ? error.message : 'Error desconocido')
    logger.error('[MercadoPago] Stack:', error instanceof Error ? error.stack : 'No disponible')
    logger.warn('[MercadoPago] ⚠️ Posibles causas:')
    logger.warn('  2️⃣ Problema con la librería de Mercado Pago')
    logger.warn('  3️⃣ Ventana emergente bloqueada por navegador')
    throw error
  }
}

/**
 * Complete payment flow: create preference + open checkout
 */
export async function initiatePayment(data: {
  contact_id: string
  level_id: number
  level_name: string
  amount: number
  payer_email: string
  payer_name: string
}): Promise<void> {
  
  try {
    // Ensure SDK is initialized
    try {
      await initMercadoPago()
    } catch (initError) {
      logger.error('[MercadoPago] ❌ Error al inicializar SDK:', initError)
      throw new Error(`No se pudo inicializar Mercado Pago: ${initError instanceof Error ? initError.message : 'Error desconocido'}`)
    }
    
    // Create preference
    let preferenceResult: PaymentPreferenceResponse
    try {
      preferenceResult = await createPaymentPreference(data)
    } catch (prefError) {
      logger.error('[MercadoPago] ❌ Error al crear preferencia:', prefError)
      throw new Error(`No se pudo crear la preferencia: ${prefError instanceof Error ? prefError.message : 'Error desconocido'}`)
    }

    if (!preferenceResult?.preference_id) {
      const errorMsg = 'No se recibió preference_id del servidor'
      logger.error('[MercadoPago] ❌ ' + errorMsg)
      logger.error('[MercadoPago] Respuesta del servidor:', preferenceResult)
      throw new Error(errorMsg)
    }
    
    // Open checkout modal
    try {
      await openCheckout(preferenceResult.preference_id)
    } catch (checkoutError) {
      logger.error('[MercadoPago] ❌ Error al abrir checkout:', checkoutError)
      throw new Error(`No se pudo abrir el checkout: ${checkoutError instanceof Error ? checkoutError.message : 'Error desconocido'}`)
    }
  } catch (error) {
    logger.error('[MercadoPago] ❌ Error en flujo de pago:', error)
    logger.error('[MercadoPago] Tipo:', typeof error)
    logger.error('[MercadoPago] Mensaje:', error instanceof Error ? error.message : error)
    logger.error('[MercadoPago] Stack:', error instanceof Error ? error.stack : 'No disponible')
    logger.warn('[MercadoPago] ⚠️ El pago no se pudo procesar')
    throw error
  }
}

/**
 * Get payment status from URL parameters (after redirect)
 */
export function getPaymentStatusFromUrl(): {
  status: 'success' | 'failure' | 'pending' | null
  payment_id?: string
  preference_id?: string
} | null {
  try {
    const params = new URLSearchParams(window.location.search)
    
    const collection_status = params.get('collection_status')
    const payment_id = params.get('payment_id')
    const preference_id = params.get('preference_id')
    
    if (!collection_status) {
      return null
    }

    // Map MercadoPago status to our simplified status
    let status: 'success' | 'failure' | 'pending' | null = null
    
    if (collection_status === 'approved') {
      status = 'success'
    } else if (collection_status === 'rejected') {
      status = 'failure'
      logger.error('[MercadoPago] ❌ Pago rechazado')
    } else if (collection_status === 'pending' || collection_status === 'in_process') {
      status = 'pending'
      logger.warn('[MercadoPago] ⏳ Pago pendiente')
    } else {
      logger.warn(`[MercadoPago] ⚠️ Estado desconocido: ${collection_status}`)
    }

    return {
      status,
      payment_id: payment_id || undefined,
      preference_id: preference_id || undefined
    }
  } catch (error) {
    logger.error('[MercadoPago] ❌ Error al procesar parámetros de URL:', error)
    logger.error('[MercadoPago] Stack:', error instanceof Error ? error.stack : 'No disponible')
    return null
  }
}

export default {
  initMercadoPago,
  createPaymentPreference,
  openCheckout,
  initiatePayment,
  getPaymentStatusFromUrl
}
