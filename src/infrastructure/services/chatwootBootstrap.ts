import { logger } from '@/infrastructure/logging/logger'

export function initChatwoot(): void {
  const baseUrlRaw = (import.meta.env.VITE_CHATWOOT_BASE_URL as string | undefined) || ''
  const token = (import.meta.env.VITE_CHATWOOT_TOKEN as string | undefined) || ''
  const integrity = (import.meta.env.VITE_CHATWOOT_SDK_INTEGRITY as string | undefined) || ''

  const baseUrl = baseUrlRaw.trim().replace(/\/+$/, '')

  if (!baseUrl || !token) {
    if (import.meta.env.DEV) {
      logger.warn('[Chatwoot] No configurado: faltan VITE_CHATWOOT_BASE_URL o VITE_CHATWOOT_TOKEN')
    }
    return
  }

  if (typeof document === 'undefined') {
    return
  }

  if (document.getElementById('chatwoot-sdk')) {
    return
  }

  const script = document.createElement('script')
  script.id = 'chatwoot-sdk'
  script.src = `${baseUrl}/packs/js/sdk.js`
  script.async = true

  if (integrity && !integrity.includes('%VITE_')) {
    script.integrity = integrity
    script.crossOrigin = 'anonymous'
  }

  script.onload = () => {
    const sdk = (window as any).chatwootSDK
    if (!sdk || typeof sdk.run !== 'function') {
      return
    }
    sdk.run({
      websiteToken: token,
      baseUrl
    })
  }

  document.head.appendChild(script)
}
