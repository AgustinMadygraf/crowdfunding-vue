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
  if (mpInitialized) return

  const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY
  
  if (!publicKey || publicKey.includes('%VITE_')) {
    console.warn('[MercadoPago] Public key not configured. Payment features disabled.')
    return
  }

  try {
    await loadMercadoPago()
    mp = new (window as any).MercadoPago(publicKey, {
      locale: 'es-AR'
    })
    mpInitialized = true
    console.log('[MercadoPago] SDK initialized successfully')
  } catch (error) {
    console.error('[MercadoPago] Failed to initialize SDK:', error)
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
  
  console.log('[MercadoPago] Creating payment preference...', {
    amount: data.amount,
    level: data.level_name
  })

  try {
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
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP ${response.status}`)
    }

    const result = await response.json()
    console.log('[MercadoPago] Preference created:', result.preference_id)
    
    return result
  } catch (error) {
    console.error('[MercadoPago] Failed to create preference:', error)
    throw error
  }
}

/**
 * Open MercadoPago Checkout Pro modal
 * @param preferenceId - Preference ID returned by createPaymentPreference
 */
export async function openCheckout(preferenceId: string): Promise<void> {
  if (!mpInitialized || !mp) {
    throw new Error('MercadoPago SDK not initialized. Call initMercadoPago() first.')
  }

  console.log('[MercadoPago] Opening Checkout Pro modal...', preferenceId)

  try {
    // Create checkout instance
    const checkout = mp.checkout({
      preference: {
        id: preferenceId
      },
      autoOpen: true // Open modal automatically
    })

    // Optional: listen to checkout events
    checkout.on('submit', () => {
      console.log('[MercadoPago] Payment submitted')
    })

  } catch (error) {
    console.error('[MercadoPago] Failed to open checkout:', error)
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
    await initMercadoPago()
    
    // Create preference
    const { preference_id } = await createPaymentPreference(data)
    
    // Open checkout modal
    await openCheckout(preference_id)
    
    console.log('[MercadoPago] Payment flow initiated successfully')
  } catch (error) {
    console.error('[MercadoPago] Payment flow failed:', error)
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
  } else if (collection_status === 'pending' || collection_status === 'in_process') {
    status = 'pending'
  }

  return {
    status,
    payment_id: payment_id || undefined,
    preference_id: preference_id || undefined
  }
}

export default {
  initMercadoPago,
  createPaymentPreference,
  openCheckout,
  initiatePayment,
  getPaymentStatusFromUrl
}
