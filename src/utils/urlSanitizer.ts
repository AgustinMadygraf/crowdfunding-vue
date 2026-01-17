 /**
 * URL Sanitizer
 * Previene XSS validando y sanitizando URLs de recursos externos
 */

/**
 * Lista blanca de protocolos permitidos para URLs
 */
const ALLOWED_PROTOCOLS = ['http:', 'https:', 'data:']

/**
 * Lista blanca de dominios confiables para avatares
 * Incluye proveedores de OAuth comunes
 */
const TRUSTED_AVATAR_DOMAINS = [
  'lh3.googleusercontent.com', // Google avatars
  'avatars.githubusercontent.com', // GitHub avatars
  'graph.facebook.com', // Facebook avatars
  'platform-lookaside.fbsbx.com', // Facebook CDN
  'secure.gravatar.com', // Gravatar
  'i.pravatar.cc', // Placeholder avatars (desarrollo)
  'ui-avatars.com', // Placeholder avatars (desarrollo)
]

/**
 * Avatar por defecto como data URL (1x1 transparent pixel)
 */
const DEFAULT_AVATAR = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="40" fill="%23e0e0e0"/%3E%3Cpath d="M50 45a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm0 5c-13.3 0-20 6.7-20 15v10h40V65c0-8.3-6.7-15-20-15z" fill="%23bdbdbd"/%3E%3C/svg%3E'

/**
 * Valida si una URL es segura
 * @param url URL a validar
 * @returns true si la URL es segura, false en caso contrario
 */
export function isUrlSafe(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string') {
    return false
  }

  // Sanitizar whitespace
  const trimmedUrl = url.trim()

  // Rechazar URLs vacías o con solo espacios
  if (trimmedUrl.length === 0) {
    return false
  }

  // Detectar intentos de inyección JavaScript
  const lowerUrl = trimmedUrl.toLowerCase()
  if (
    lowerUrl.startsWith('javascript:') ||
    lowerUrl.startsWith('data:text/html') ||
    lowerUrl.startsWith('vbscript:') ||
    lowerUrl.includes('<script') ||
    lowerUrl.includes('onerror=') ||
    lowerUrl.includes('onload=')
  ) {
    console.warn('[UrlSanitizer] 🚨 URL peligrosa bloqueada:', trimmedUrl.substring(0, 50))
    return false
  }

  try {
    const urlObj = new URL(trimmedUrl)

    // Validar protocolo
    if (!ALLOWED_PROTOCOLS.includes(urlObj.protocol)) {
      console.warn('[UrlSanitizer] ⚠️ Protocolo no permitido:', urlObj.protocol)
      return false
    }

    // Permitir data URLs para imágenes
    if (urlObj.protocol === 'data:') {
      // Solo permitir imágenes
      if (lowerUrl.startsWith('data:image/')) {
        return true
      }
      console.warn('[UrlSanitizer] ⚠️ Data URL no es imagen')
      return false
    }

    // Para HTTP/HTTPS, validar dominio
    if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
      const hostname = urlObj.hostname.toLowerCase()
      
      // Verificar si el dominio está en la lista blanca
      const isTrusted = TRUSTED_AVATAR_DOMAINS.some(domain => 
        hostname === domain || hostname.endsWith('.' + domain)
      )

      if (!isTrusted) {
        console.warn('[UrlSanitizer] ⚠️ Dominio no confiable:', hostname)
        return false
      }

      return true
    }

    return false
  } catch (error) {
    // URL inválida (no se puede parsear)
    console.warn('[UrlSanitizer] ❌ URL inválida:', trimmedUrl.substring(0, 50))
    return false
  }
}

/**
 * Sanitiza una URL de avatar
 * Si la URL no es segura, retorna un avatar por defecto
 * 
 * @param url URL del avatar a sanitizar
 * @param fallback URL de fallback (opcional)
 * @returns URL sanitizada o avatar por defecto
 */
export function sanitizeAvatarUrl(
  url: string | undefined | null,
  fallback: string = DEFAULT_AVATAR
): string {
  if (isUrlSafe(url)) {
    return url!.trim()
  }

  if (url) {
    console.warn('[UrlSanitizer] 🛡️ URL de avatar bloqueada, usando fallback')
  }

  return fallback
}

/**
 * Sanitiza una URL genérica
 * Si la URL no es segura, retorna null
 * 
 * @param url URL a sanitizar
 * @returns URL sanitizada o null
 */
export function sanitizeUrl(url: string | undefined | null): string | null {
  try {
    if (isUrlSafe(url)) {
      return url!.trim()
    }

    return null
  } catch (error) {
    console.error('Error sanitizando URL', error)
    throw error
  }
}
