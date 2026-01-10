/**
 * Servicio de Autenticación con Google OAuth
 * Maneja login/logout y gestión de sesiones
 */

import type { User } from '@/domain/user'

interface GoogleAuthResponse {
  user_id: string
  email: string
  nombre: string
  avatar_url?: string
  auth_token: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

class AuthService {
  private authState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  }

  private readonly API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
  private readonly GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
  private readonly TOKEN_STORAGE_KEY = 'auth_token'
  private readonly USER_STORAGE_KEY = 'auth_user'

  constructor() {
    // Validar que el client_id esté configurado
    if (!this.GOOGLE_CLIENT_ID) {
      console.error('[Auth] VITE_GOOGLE_CLIENT_ID no está configurado en las variables de entorno')
      console.warn('[Auth] Por favor, crea un archivo .env con VITE_GOOGLE_CLIENT_ID=tu_client_id')
      this.authState.error = 'Configuración de Google OAuth incompleta'
    } else {
      console.log('[Auth] Google Client ID configurado correctamente')
    }

    this.loadStoredAuth()
    this.loadGoogleScript()
  }

  /**
   * Carga el script de Google Identity Services
   */
  private loadGoogleScript(): void {
    try {
      if (document.getElementById('google-jssdk')) {
        console.log('[Auth] Google SDK script ya cargado')
        return
      }

      const script = document.createElement('script')
      script.id = 'google-jssdk'
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      
      script.onerror = () => {
        console.error('[Auth] Error al cargar Google Identity Services SDK')
        this.authState.error = 'No se pudo cargar Google Sign-In'
      }
      
      script.onload = () => {
        console.log('[Auth] Google Identity Services SDK cargado exitosamente')
      }
      
      document.head.appendChild(script)
    } catch (error) {
      console.error('[Auth] Error al inicializar Google SDK:', error)
      this.authState.error = 'Error de inicialización'
    }
  }

  /**
   * Inicia sesión con Google
   * @param token Token de ID de Google
   */
  async loginWithGoogle(token: string): Promise<User> {
    this.authState.isLoading = true
    this.authState.error = null

    try {
      // Validar que el token esté disponible
      if (!token || token.trim() === '') {
        const errorMsg = 'Token de Google no válido'
        console.error(`[Auth] ${errorMsg}`)
        throw new Error(errorMsg)
      }

      console.log(`[Auth] Enviando solicitud de autenticación a ${this.API_BASE_URL}/api/auth/google`)
      
      // Enviar token a backend para validación
      const response = await fetch(`${this.API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      }).catch((fetchError) => {
        console.error('[Auth] Error de conexión al servidor:', fetchError)
        throw new Error(`No se pudo conectar al servidor: ${fetchError.message}`)
      })

      if (!response.ok) {
        const statusError = `HTTP ${response.status}: ${response.statusText}`
        console.error(`[Auth] Error de respuesta del servidor: ${statusError}`)
        console.warn(`[Auth] Verifica que el servidor esté ejecutándose y CORS esté configurado correctamente`)
        throw new Error(`Error de autenticación: ${statusError}`)
      }

      let data: GoogleAuthResponse
      try {
        data = await response.json()
      } catch (parseError) {
        console.error('[Auth] Error al parsear respuesta JSON:', parseError)
        throw new Error('La respuesta del servidor no es válida')
      }

      // Validar datos de respuesta
      if (!data.user_id || !data.email || !data.auth_token) {
        console.error('[Auth] Datos incompletos en respuesta del servidor:', data)
        throw new Error('Respuesta del servidor incompleta')
      }

      // Guardar token y usuario
      const user: User = {
        id: data.user_id,
        email: data.email,
        nombre: data.nombre,
        avatar_url: data.avatar_url
      }

      try {
        this.authState.user = user
        this.authState.token = data.auth_token
        this.authState.isAuthenticated = true

        // Persistir en localStorage
        localStorage.setItem(this.TOKEN_STORAGE_KEY, data.auth_token)
        localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user))
      } catch (storageError) {
        console.warn('[Auth] Error al guardar en localStorage:', storageError)
        console.warn('[Auth] La sesión funcionará pero no será persistida')
      }

      console.log('[Auth] Usuario autenticado correctamente:', user.email)

      return user
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido'
      this.authState.error = message
      console.error('[Auth] Error de autenticación:', message)
      console.error('[Auth] Detalles del error:', error)
      throw error
    } finally {
      this.authState.isLoading = false
    }
  }

  /**
   * Cierra sesión
   */
  logout(): void {
    try {
      this.authState.user = null
      this.authState.token = null
      this.authState.isAuthenticated = false
      this.authState.error = null

      try {
        localStorage.removeItem(this.TOKEN_STORAGE_KEY)
        localStorage.removeItem(this.USER_STORAGE_KEY)
      } catch (storageError) {
        console.warn('[Auth] Error al limpiar localStorage:', storageError)
      }

      // Revocar sesión de Google si está disponible
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.disableAutoSelect()
        } catch (googleError) {
          console.warn('[Auth] Error al revocar sesión de Google:', googleError)
        }
      }

      console.log('[Auth] Sesión cerrada exitosamente')
    } catch (error) {
      console.error('[Auth] Error inesperado al cerrar sesión:', error)
    }
  }

  /**
   * Carga autenticación previamente almacenada
   */
  private loadStoredAuth(): void {
    try {
      const token = localStorage.getItem(this.TOKEN_STORAGE_KEY)
      const userStr = localStorage.getItem(this.USER_STORAGE_KEY)

      if (token && userStr) {
        this.authState.user = JSON.parse(userStr)
        this.authState.token = token
        this.authState.isAuthenticated = true
        console.log('[Auth] Sesión restaurada desde localStorage')
      } else {
        console.log('[Auth] No hay sesión previa almacenada')
      }
    } catch (error) {
      console.error('[Auth] Error al cargar autenticación almacenada:', error)
      console.warn('[Auth] Limpiando datos de sesión corruptos')
      this.logout()
    }
  }

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser(): User | null {
    return this.authState.user
  }

  /**
   * Obtiene el token de autenticación
   */
  getAuthToken(): string | null {
    return this.authState.token
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.authState.isAuthenticated
  }

  /**
   * Obtiene el estado actual de autenticación
   */
  getAuthState(): Readonly<AuthState> {
    return Object.freeze({ ...this.authState })
  }

  /**
   * Obtiene headers con token de autenticación
   */
  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    if (this.authState.token) {
      headers['Authorization'] = `Bearer ${this.authState.token}`
    }

    return headers
  }

  /**
   * Verifica si Google Client ID está configurado
   */
  isGoogleConfigured(): boolean {
    return !!this.GOOGLE_CLIENT_ID && this.GOOGLE_CLIENT_ID.trim() !== ''
  }

  /**
   * Obtiene información de configuración (sin exponer el client_id completo)
   */
  getConfigInfo(): { configured: boolean; clientIdPrefix: string } {
    return {
      configured: this.isGoogleConfigured(),
      clientIdPrefix: this.GOOGLE_CLIENT_ID ? this.GOOGLE_CLIENT_ID.substring(0, 20) + '...' : 'NO CONFIGURADO'
    }
  }

  /**
   * Inicializa Google Sign-In
   * @param containerId ID del contenedor para el botón
   * @param callback Callback cuando el usuario se autentica
   */
  initGoogleSignIn(
    containerId: string,
    callback: (token: string) => void
  ): void {
    try {
      // Validar que Google SDK esté cargado
      if (!window.google?.accounts?.id) {
        const errorMsg = 'Google Identity Services SDK no está cargado'
        console.error(`[Auth] ${errorMsg}`)
        console.warn('[Auth] Verifica tu conexión a internet y recarga la página')
        this.authState.error = 'SDK de Google no disponible'
        return
      }

      // Validar que el client_id esté configurado
      if (!this.GOOGLE_CLIENT_ID || this.GOOGLE_CLIENT_ID.trim() === '') {
        const errorMsg = 'client_id de Google no configurado'
        console.error(`[Auth] ${errorMsg}`)
        console.warn('[Auth] Configura VITE_GOOGLE_CLIENT_ID en tu archivo .env')
        this.authState.error = 'Client ID no configurado'
        return
      }

      console.log('[Auth] Inicializando Google Sign-In...')

      try {
        window.google.accounts.id.initialize({
          client_id: this.GOOGLE_CLIENT_ID,
          callback: (response: CredentialResponse) => {
            try {
              console.log('[Auth] Usuario autenticado con Google')
              callback(response.credential)
            } catch (callbackError) {
              console.error('[Auth] Error en callback de autenticación:', callbackError)
              this.authState.error = 'Error procesando autenticación'
            }
          },
          ux_mode: 'popup',
          auto_select: false,
          error_callback: () => {
            const errorMsg = 'Error en Google Sign-In initialization'
            console.error(`[Auth] ${errorMsg}`)
            console.warn('[Auth] Verifica que el Client ID esté en la lista blanca en Google Cloud Console')
            this.authState.error = 'Error de configuración de Google Sign-In'
          }
        })
      } catch (initError) {
        console.error('[Auth] Error al inicializar Google Sign-In:', initError)
        console.warn('[Auth] El origen (origin) puede no estar permitido en Google Cloud Console')
        throw initError
      }

      const container = document.getElementById(containerId)
      if (!container) {
        console.error(`[Auth] Contenedor #${containerId} no encontrado en el DOM`)
        console.warn(`[Auth] Verifica que exista un elemento con id="${containerId}"`)
        return
      }

      try {
        window.google.accounts.id.renderButton(
          container,
          {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            locale: 'es'
          }
        )
        console.log('[Auth] Botón de Google Sign-In renderizado exitosamente')
      } catch (renderError) {
        console.error('[Auth] Error al renderizar botón de Google Sign-In:', renderError)
        console.warn('[Auth] El contenedor puede estar vacío o mal configurado')
        throw renderError
      }
    } catch (error) {
      console.error('[Auth] Error al inicializar Google Sign-In:', error)
      console.error('[Auth] Detalles:', error instanceof Error ? error.message : 'Error desconocido')
      this.authState.error = 'Error de inicialización de Google Sign-In'
      throw error
    }
  }
}

// Tipos para Google Identity
interface CredentialResponse {
  credential: string
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void
          renderButton: (element: HTMLElement, options: any) => void
          disableAutoSelect: () => void
        }
      }
    }
  }
}

// Exportar singleton
export const authService = new AuthService()
export type { User, AuthState, GoogleAuthResponse }
