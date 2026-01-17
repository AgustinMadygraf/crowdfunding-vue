

/**
 * CSRF Protection Service
 * Maneja la lectura y gestión de tokens CSRF
 */

/**
 * Interfaz para el servicio de CSRF
 */
export interface ICsrfService {
  /**
   * Obtiene el token CSRF desde cookie o header
   * @returns Token CSRF o null si no está disponible
   */
  getToken(): string | null

  /**
   * Lee el token CSRF desde una cookie específica
   * @param cookieName Nombre de la cookie (default: 'XSRF-TOKEN')
   * @returns Valor de la cookie o null
   */
  readFromCookie(cookieName?: string): string | null

  /**
   * Lee el token CSRF desde un header de respuesta
   * @param headerName Nombre del header (default: 'X-CSRF-Token')
   * @returns Valor del header o null
   */
  readFromHeader(headerName?: string): string | null

  /**
   * Almacena el token CSRF para usar en request posteriores
   * @param token Token a almacenar
   */
  setToken(token: string): void

  /**
   * Obtiene el header que debe enviarse con el token CSRF
   * @param token Token CSRF
   * @param headerName Nombre del header (default: 'X-CSRF-Token')
   * @returns Objeto para usar en headers de fetch
   */
  getTokenHeader(token: string, headerName?: string): Record<string, string>
}

/**
 * Implementación por defecto del servicio CSRF
 */
export class DefaultCsrfService implements ICsrfService {
  private token: string | null = null
  private readonly CSRF_COOKIE_NAME = 'XSRF-TOKEN'
  private readonly CSRF_HEADER_NAME = 'X-CSRF-Token'
  constructor() {}

  /**
   * Obtiene el token CSRF
   * Intenta en orden: memoria → localStorage → cookie
   */
  getToken(): string | null {
    if (this.token) {
      return this.token
    }

    // Intentar leer de cookie
    const cookieToken = this.readFromCookie()
    if (cookieToken) {
      this.token = cookieToken
      return cookieToken
    }

    return null
  }

  /**
   * Lee el token de una cookie
   */
  readFromCookie(cookieName: string = this.CSRF_COOKIE_NAME): string | null {
    if (typeof document === 'undefined') {
      return null
    }

    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=')
      if (name === cookieName && value) {
        return decodeURIComponent(value)
      }
    }

    return null
  }

  /**
   * Lee el token de un header (meta tag)
   * Útil si el backend inyecta el token en el HTML
   */
  readFromHeader(headerName: string = this.CSRF_HEADER_NAME): string | null {
    if (typeof document === 'undefined') {
      return null
    }

    const metaTag = document.querySelector(`meta[name="${headerName}"]`)
    if (metaTag) {
      const content = metaTag.getAttribute('content')
      return content ? decodeURIComponent(content) : null
    }

    return null
  }

  /**
   * Almacena el token en memoria y localStorage
   */
  setToken(token: string): void {
    this.token = token
  }

  /**
   * Obtiene el header para enviar el token CSRF
   */
  getTokenHeader(
    token: string = this.token || '',
    headerName: string = this.CSRF_HEADER_NAME
  ): Record<string, string> {
    if (!token) {
      return {}
    }

    return {
      [headerName]: token
    }
  }

}

/**
 * Instancia singleton del servicio CSRF
 */
export const csrfService = new DefaultCsrfService()

export async function fetchCsrfToken() {
  try {
    // ...existing code...
  } catch (error) {
    console.error('Error obteniendo CSRF token', error)
    throw error
  }
}
