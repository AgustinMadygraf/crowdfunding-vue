/**
 * MercadoPago Service
 * Handles payment integration with MercadoPago Checkout Pro
 */

import { loadMercadoPago } from '@mercadopago/sdk-js'

// MercadoPago SDK instance (loaded asynchronously)
let mp: any = null
let mpInitialized = false

/**
 * Initialize MercadoPago SDK
 * Must be called before using payment features
 */
export async function initMercadoPago(): Promise<void> {
  if (mpInitialized) {
    console.log('[MercadoPago] ✅ SDK ya está inicializado, saltando inicialización')
    return
  }

  const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY
  
  console.log('[MercadoPago] 🔧 Iniciando configuración de Mercado Pago...')
  console.log(`[MercadoPago] 🔑 Public Key: ${publicKey ? publicKey.substring(0, 15) + '...' : 'NO CONFIGURADA'}`)

  // Validar que la clave pública esté configurada
  if (!publicKey) {
    const errorMsg = '❌ VITE_MERCADOPAGO_PUBLIC_KEY no está configurada'
    console.error(`[MercadoPago] ${errorMsg}`)
    console.warn('[MercadoPago] ⚠️ Pasos para configurar:')
    console.warn('  1️⃣ Ve a https://www.mercadopago.com.ar/developers/panel/app')
    console.warn('  2️⃣ Crea una aplicación')
    console.warn('  3️⃣ Copia la "Public Key"')
    console.warn('  4️⃣ Agrega en .env: VITE_MERCADOPAGO_PUBLIC_KEY=tu_public_key')
    console.warn('[MercadoPago] 💡 Para testing: usa claves de prueba (TEST-...)')
    console.warn('[MercadoPago] Pagos deshabilitados hasta configurar esta clave')
    return
  }

  if (publicKey.includes('%VITE_') || publicKey.includes('your_public_key')) {
    const errorMsg = '❌ VITE_MERCADOPAGO_PUBLIC_KEY es un placeholder'
    console.error(`[MercadoPago] ${errorMsg}`)
    console.error('[MercadoPago] Valor actual:', publicKey)
    console.warn('[MercadoPago] ⚠️ Clave no válida - reemplaza con tu Public Key real')
    console.warn('[MercadoPago] Pagos deshabilitados')
    return
  }

  try {
    console.log('[MercadoPago] 📥 Cargando SDK de Mercado Pago...')
    await loadMercadoPago()
    console.log('[MercadoPago] ✅ SDK cargado exitosamente')

    try {
      console.log('[MercadoPago] 🔐 Inicializando instancia de Mercado Pago...')
      mp = new (window as any).MercadoPago(publicKey, {
        locale: 'es-AR'
      })
      mpInitialized = true
      console.log('[MercadoPago] ✅ SDK inicializado correctamente')
      console.log('[MercadoPago] 🌐 Locale: es-AR')
    } catch (initError) {
      console.error('[MercadoPago] ❌ Error al inicializar instancia:', initError)
      console.error('[MercadoPago] Stack:', initError instanceof Error ? initError.stack : 'No disponible')
      console.warn('[MercadoPago] Posibles causas:')
      console.warn('  1️⃣ Public Key inválida o expirada')
      console.warn('  2️⃣ SDK no cargó correctamente')
      console.warn('  3️⃣ Problema de conexión a mercadopago.com')
      throw initError
    }
  } catch (error) {
    console.error('[MercadoPago] ❌ Error al cargar SDK:', error)
    console.error('[MercadoPago] Mensaje:', error instanceof Error ? error.message : 'Error desconocido')
    console.error('[MercadoPago] Stack:', error instanceof Error ? error.stack : 'No disponible')
    console.warn('[MercadoPago] ⚠️ Soluciones:')
    console.warn('  1️⃣ Verifica tu conexión a internet')
    console.warn('  2️⃣ Verifica que no hay bloqueador de scripts')
    console.warn('  3️⃣ Recarga la página')
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
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
  
  console.log('[MercadoPago] 📝 Creando preferencia de pago...')
  console.log('[MercadoPago] 💰 Datos:', {
    monto: `$${data.amount}`,
    nivel: data.level_name,
    email: data.payer_email
  })
  console.log(`[MercadoPago] 📍 Endpoint: ${apiUrl}/api/payments/create`)

  try {
    // Validar que contacto_id esté disponible
    if (!data.contact_id) {
      throw new Error('contact_id es requerido para crear la preferencia')
    }

    console.log('[MercadoPago] 📤 Enviando solicitud al backend...')
    
    const response = await fetch(`${apiUrl}/api/payments/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contact_id: data.contact_id,
        level_id: data.level_id,
        items: [{
          title: `Contribución ${data.level_name} - Proyecto RKHA190`,
          description: `Crowdfunding para adquisición de rotativa RKHA190 - Madypack`,
          quantity: 1,
          unit_price: data.amount,
          currency_id: 'ARS'
        }],
        payer: {
          email: data.payer_email,
          name: data.payer_name
        },
        back_urls: {
          success: `${window.location.origin}/suscribir/estado/success`,
          failure: `${window.location.origin}/suscribir/estado/failure`,
          pending: `${window.location.origin}/suscribir/estado/pending`
        },
        auto_return: 'approved',
        notification_url: `${apiUrl}/api/webhooks/mercadopago`
      })
    }).catch((fetchError) => {
      console.error('[MercadoPago] ❌ Error de conexión:', fetchError)
      console.error('[MercadoPago] 🌐 URL del servidor:', apiUrl)
      console.error('[MercadoPago] Mensaje:', fetchError instanceof Error ? fetchError.message : 'Error desconocido')
      console.warn('[MercadoPago] ⚠️ Posibles causas:')
      console.warn('  1️⃣ Servidor no está ejecutándose')
      console.warn('  2️⃣ URL del servidor es incorrecta')
      console.warn('  3️⃣ Problemas de red/conectividad')
      throw new Error(`No se pudo conectar al servidor: ${fetchError instanceof Error ? fetchError.message : 'Error desconocido'}`)
    })

    if (!response.ok) {
      console.error(`[MercadoPago] ❌ Respuesta del servidor: HTTP ${response.status} ${response.statusText}`)
      
      let errorData: any = {}
      try {
        errorData = await response.json()
        console.error('[MercadoPago] 📋 Respuesta del servidor:', errorData)
      } catch (parseErr) {
        console.warn('[MercadoPago] ⚠️ No se pudo parsear respuesta de error')
        const text = await response.text()
        console.error('[MercadoPago] Contenido:', text)
      }

      const errorMsg = errorData.message || errorData.error || `HTTP ${response.status}`
      console.error('[MercadoPago] 💬 Mensaje de error:', errorMsg)
      console.warn('[MercadoPago] ⚠️ Soluciones:')
      console.warn('  1️⃣ Verifica que el backend está ejecutándose')
      console.warn('  2️⃣ Verifica la URL en VITE_API_BASE_URL')
      console.warn('  3️⃣ Verifica CORS en el backend')
      throw new Error(errorMsg)
    }

    let result: any
    try {
      result = await response.json()
      console.log('[MercadoPago] ✅ Preferencia creada exitosamente')
      console.log('[MercadoPago] 🎫 Preference ID:', result.preference_id)
    } catch (parseError) {
      console.error('[MercadoPago] ❌ Error al parsear respuesta JSON:', parseError)
      console.error('[MercadoPago] Stack:', parseError instanceof Error ? parseError.stack : 'No disponible')
      throw new Error('Respuesta inválida del servidor')
    }
    
    return result
  } catch (error) {
    console.error('[MercadoPago] ❌ Error al crear preferencia:', error)
    console.error('[MercadoPago] Tipo de error:', typeof error)
    console.error('[MercadoPago] Detalles:', error instanceof Error ? error.message : error)
    throw error
  }
}

/**
 * Open MercadoPago Checkout Pro modal
 * @param preferenceId - Preference ID returned by createPaymentPreference
 */
export async function openCheckout(preferenceId: string): Promise<void> {
  console.log('[MercadoPago] 🛒 Abriendo Mercado Pago Checkout Pro...')
  console.log(`[MercadoPago] 🎫 Preference ID: ${preferenceId}`)

  if (!mpInitialized || !mp) {
    const errorMsg = 'SDK de Mercado Pago no está inicializado'
    console.error(`[MercadoPago] ❌ ${errorMsg}`)
    console.error('[MercadoPago] mpInitialized:', mpInitialized)
    console.error('[MercadoPago] mp:', !!mp)
    console.warn('[MercadoPago] ⚠️ Llama a initMercadoPago() antes de openCheckout()')
    throw new Error(errorMsg)
  }

  try {
    console.log('[MercadoPago] 🔧 Creando instancia de checkout...')
    
    // Create checkout instance
    const checkout = mp.checkout({
      preference: {
        id: preferenceId
      },
      autoOpen: true // Open modal automatically
    })

    console.log('[MercadoPago] ✅ Checkout abierto exitosamente')

    // Optional: listen to checkout events
    try {
      checkout.on('submit', () => {
        console.log('[MercadoPago] 💳 Formulario de pago enviado')
      })
      console.log('[MercadoPago] 🎧 Event listeners configurados')
    } catch (eventError) {
      console.warn('[MercadoPago] ⚠️ Error al configurar event listeners:', eventError)
      // No es crítico, continuamos
    }

  } catch (error) {
    console.error('[MercadoPago] ❌ Error al abrir checkout:', error)
    console.error('[MercadoPago] Mensaje:', error instanceof Error ? error.message : 'Error desconocido')
    console.error('[MercadoPago] Stack:', error instanceof Error ? error.stack : 'No disponible')
    console.warn('[MercadoPago] ⚠️ Posibles causas:')
    console.warn('  1️⃣ Preference ID inválido o expirado')
    console.warn('  2️⃣ Problema con la librería de Mercado Pago')
    console.warn('  3️⃣ Ventana emergente bloqueada por navegador')
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
  console.log('[MercadoPago] 🚀 Iniciando flujo de pago completo...')
  
  try {
    // Ensure SDK is initialized
    console.log('[MercadoPago] 1️⃣ Verificando inicialización de SDK...')
    try {
      await initMercadoPago()
      console.log('[MercadoPago] ✅ SDK inicializado')
    } catch (initError) {
      console.error('[MercadoPago] ❌ Error al inicializar SDK:', initError)
      throw new Error(`No se pudo inicializar Mercado Pago: ${initError instanceof Error ? initError.message : 'Error desconocido'}`)
    }
    
    // Create preference
    console.log('[MercadoPago] 2️⃣ Creando preferencia de pago...')
    let preferenceResult: any
    try {
      preferenceResult = await createPaymentPreference(data)
      console.log('[MercadoPago] ✅ Preferencia creada')
    } catch (prefError) {
      console.error('[MercadoPago] ❌ Error al crear preferencia:', prefError)
      throw new Error(`No se pudo crear la preferencia: ${prefError instanceof Error ? prefError.message : 'Error desconocido'}`)
    }

    if (!preferenceResult?.preference_id) {
      const errorMsg = 'Preference ID no recibido del servidor'
      console.error('[MercadoPago] ❌ ' + errorMsg)
      console.error('[MercadoPago] Respuesta del servidor:', preferenceResult)
      throw new Error(errorMsg)
    }
    
    // Open checkout modal
    console.log('[MercadoPago] 3️⃣ Abriendo modal de pago...')
    try {
      await openCheckout(preferenceResult.preference_id)
      console.log('[MercadoPago] ✅ Modal abierto')
    } catch (checkoutError) {
      console.error('[MercadoPago] ❌ Error al abrir checkout:', checkoutError)
      throw new Error(`No se pudo abrir el checkout: ${checkoutError instanceof Error ? checkoutError.message : 'Error desconocido'}`)
    }
    
    console.log('[MercadoPago] 🎉 Flujo de pago iniciado exitosamente')
  } catch (error) {
    console.error('[MercadoPago] ❌ Error en flujo de pago:', error)
    console.error('[MercadoPago] Tipo:', typeof error)
    console.error('[MercadoPago] Mensaje:', error instanceof Error ? error.message : error)
    console.error('[MercadoPago] Stack:', error instanceof Error ? error.stack : 'No disponible')
    console.warn('[MercadoPago] ⚠️ El pago no se pudo procesar')
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
      console.log('[MercadoPago] ℹ️ Sin parámetros de pago en URL')
      return null
    }

    console.log('[MercadoPago] 📍 Parámetros de pago detectados:')
    console.log('[MercadoPago] collection_status:', collection_status)
    console.log('[MercadoPago] payment_id:', payment_id)
    console.log('[MercadoPago] preference_id:', preference_id)

    // Map MercadoPago status to our simplified status
    let status: 'success' | 'failure' | 'pending' | null = null
    
    if (collection_status === 'approved') {
      status = 'success'
      console.log('[MercadoPago] ✅ Pago aprobado')
    } else if (collection_status === 'rejected') {
      status = 'failure'
      console.error('[MercadoPago] ❌ Pago rechazado')
    } else if (collection_status === 'pending' || collection_status === 'in_process') {
      status = 'pending'
      console.warn('[MercadoPago] ⏳ Pago pendiente')
    } else {
      console.warn(`[MercadoPago] ⚠️ Estado desconocido: ${collection_status}`)
    }

    return {
      status,
      payment_id: payment_id || undefined,
      preference_id: preference_id || undefined
    }
  } catch (error) {
    console.error('[MercadoPago] ❌ Error al procesar parámetros de URL:', error)
    console.error('[MercadoPago] Stack:', error instanceof Error ? error.stack : 'No disponible')
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
