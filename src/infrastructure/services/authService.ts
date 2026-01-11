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
      console.error('[Auth] ❌ VITE_GOOGLE_CLIENT_ID no está configurado en las variables de entorno')
      console.error('[Auth] Stack de ejecución iniciada en:', new Error().stack)
      console.warn('[Auth] 📋 Crea un archivo .env en la raíz del proyecto')
      console.warn('[Auth] 📋 Con contenido: VITE_GOOGLE_CLIENT_ID=tu_client_id_aqui.apps.googleusercontent.com')
      this.authState.error = 'Configuración de Google OAuth incompleta'
    } else {
      console.log('[Auth] ✅ Google Client ID configurado correctamente')
      console.log('[Auth] 🔑 Client ID:', this.GOOGLE_CLIENT_ID.substring(0, 20) + '...')
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
        console.log('[Auth] ✅ Google SDK script ya cargado')
        return
      }

      const script = document.createElement('script')
      script.id = 'google-jssdk'
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      
      script.onerror = () => {
        console.error('[Auth] ❌ Error al cargar Google Identity Services SDK')
        console.error(`[Auth] 🌐 URL intentada: https://accounts.google.com/gsi/client`)
        console.error('[Auth] Posibles causas: ')
        console.error('  1️⃣ Sin conexión a internet')
        console.error('  2️⃣ Bloqueado por firewall o antivirus')
        console.error('  3️⃣ Problemas de CORS')
        console.error('  4️⃣ accounts.google.com no es accesible')
        this.authState.error = 'No se pudo cargar Google Sign-In'
      }
      
      script.onload = () => {
        console.log('[Auth] ✅ Google Identity Services SDK cargado exitosamente')
        console.log('[Auth] window.google disponible:', !!window.google)
      }
      
      document.head.appendChild(script)
      console.log('[Auth] 📝 Script de Google agregado al DOM')
    } catch (error) {
      console.error('[Auth] ❌ Error al inicializar Google SDK:', error)
      console.error('[Auth] Stack:', error instanceof Error ? error.stack : 'No disponible')
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
        console.error(`[Auth] ❌ ${errorMsg}`)
        console.error('[Auth] El token está vacío o es undefined')
        throw new Error(errorMsg)
      }

      console.log(`[Auth] 📤 Enviando solicitud de autenticación a ${this.API_BASE_URL}/api/auth/google`)
      console.log(`[Auth] 🌐 Token length: ${token.length} caracteres`)
      
      // Enviar token a backend para validación
      const response = await fetch(`${this.API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      }).catch((fetchError) => {
        console.error('[Auth] ❌ Error de conexión al servidor:', fetchError)
        console.error('[Auth] 🌐 URL del servidor:', this.API_BASE_URL)
        console.error('[Auth] Mensaje:', fetchError instanceof Error ? fetchError.message : 'Error desconocido')
        console.error('[Auth] Stack:', fetchError instanceof Error ? fetchError.stack : 'No disponible')
        console.warn('[Auth] Posibles causas:')
        console.warn('  1️⃣ Servidor no está ejecutándose')
        console.warn('  2️⃣ URL del servidor es incorrecta')
        console.warn('  3️⃣ Problemas de conexión de red')
        console.warn('  4️⃣ CORS no está configurado en el servidor')
        throw new Error(`No se pudo conectar al servidor: ${fetchError.message}`)
      })

      if (!response.ok) {
        const statusError = `HTTP ${response.status}: ${response.statusText}`
        console.error(`[Auth] ❌ Error de respuesta del servidor: ${statusError}`)
        console.error(`[Auth] 📍 Endpoint: ${this.API_BASE_URL}/api/auth/google`)
        console.warn(`[Auth] Verifica que el servidor esté ejecutándose`)
        console.warn(`[Auth] Verifica que CORS esté configurado correctamente`)
        
        // Intentar obtener más detalles del error
        try {
          const errorData = await response.json()
          console.error('[Auth] Respuesta del servidor:', errorData)
        } catch (parseErr) {
          console.warn('[Auth] No se pudo parsear respuesta de error')
        }
        
        throw new Error(`Error de autenticación: ${statusError}`)
      }

      let data: GoogleAuthResponse
      try {
        data = await response.json()
        console.log('[Auth] ✅ Respuesta JSON recibida del servidor')
      } catch (parseError) {
        console.error('[Auth] ❌ Error al parsear respuesta JSON:', parseError)
        console.error('[Auth] Stack:', parseError instanceof Error ? parseError.stack : 'No disponible')
        throw new Error('La respuesta del servidor no es válida')
      }

      // Validar datos de respuesta
      if (!data.user_id || !data.email || !data.auth_token) {
        console.error('[Auth] ❌ Datos incompletos en respuesta del servidor:', data)
        console.error('[Auth] Campos faltantes:')
        console.error('  user_id:', !!data.user_id)
        console.error('  email:', !!data.email)
        console.error('  auth_token:', !!data.auth_token)
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
        console.log('[Auth] 💾 Sesión guardada en localStorage')
      } catch (storageError) {
        console.warn('[Auth] ⚠️ Error al guardar en localStorage:', storageError)
        console.warn('[Auth] ⚠️ La sesión funcionará pero no será persistida en recarga')
      }

      console.log('[Auth] ✅ Usuario autenticado correctamente:', user.email)

      return user
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido'
      this.authState.error = message
      console.error('[Auth] ❌ Error de autenticación:', message)
      console.error('[Auth] Detalles del error:', error)
      console.error('[Auth] Stack:', error instanceof Error ? error.stack : 'No disponible')
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
      console.log('[Auth] 🚪 Iniciando cierre de sesión...')
      
      this.authState.user = null
      this.authState.token = null
      this.authState.isAuthenticated = false
      this.authState.error = null

      try {
        localStorage.removeItem(this.TOKEN_STORAGE_KEY)
        localStorage.removeItem(this.USER_STORAGE_KEY)
        console.log('[Auth] ✅ localStorage limpiado')
      } catch (storageError) {
        console.warn('[Auth] ⚠️ Error al limpiar localStorage:', storageError)
      }

      // Revocar sesión de Google si está disponible
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.disableAutoSelect()
          console.log('[Auth] ✅ Google auto-select deshabilitado')
        } catch (googleError) {
          console.warn('[Auth] ⚠️ Error al revocar sesión de Google:', googleError)
        }
      }

      console.log('[Auth] ✅ Sesión cerrada exitosamente')
    } catch (error) {
      console.error('[Auth] ❌ Error inesperado al cerrar sesión:', error)
      console.error('[Auth] Stack:', error instanceof Error ? error.stack : 'No disponible')
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
        try {
          this.authState.user = JSON.parse(userStr)
          this.authState.token = token
          this.authState.isAuthenticated = true
          console.log('[Auth] ✅ Sesión restaurada desde localStorage')
          console.log('[Auth] 👤 Usuario:', this.authState.user?.email)
        } catch (parseError) {
          console.error('[Auth] ❌ Error al parsear datos de usuario:', parseError)
          console.warn('[Auth] Limpiando localStorage y reiniciando...')
          this.logout()
        }
      } else {
        console.log('[Auth] ℹ️ No hay sesión previa almacenada')
      }
    } catch (error) {
      console.error('[Auth] ❌ Error al cargar autenticación almacenada:', error)
      console.error('[Auth] Stack:', error instanceof Error ? error.stack : 'No disponible')
      console.warn('[Auth] ⚠️ Limpiando datos de sesión corruptos')
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
      console.log(`[Auth] 🌐 Iniciando Google Sign-In desde origen: ${window.location.origin}`)
      
      // Validar que Google SDK esté cargado
      if (!window.google?.accounts?.id) {
        const errorMsg = 'Google Identity Services SDK no está cargado'
        console.error(`[Auth] ❌ ${errorMsg}`)
        console.error('[Auth] window.google:', window.google)
        console.error('[Auth] window.google.accounts:', window.google?.accounts)
        console.warn('[Auth] Soluciones: ')
        console.warn('  1️⃣ Verifica tu conexión a internet')
        console.warn('  2️⃣ Verifica que accounts.google.com sea accesible')
        console.warn('  3️⃣ Recarga la página')
        this.authState.error = 'SDK de Google no disponible'
        return
      }

      // Validar que el client_id esté configurado
      if (!this.GOOGLE_CLIENT_ID || this.GOOGLE_CLIENT_ID.trim() === '') {
        const errorMsg = 'client_id de Google no configurado'
        console.error(`[Auth] ❌ ${errorMsg}`)
        console.warn('[Auth] Configura VITE_GOOGLE_CLIENT_ID en tu archivo .env')
        console.warn('[Auth] Formato: VITE_GOOGLE_CLIENT_ID=<tu_client_id>.apps.googleusercontent.com')
        this.authState.error = 'Client ID no configurado'
        return
      }

      console.log('[Auth] ✅ Validaciones previas correctas')
      console.log('[Auth] 🔧 Configurando Google Sign-In...')

      try {
        window.google.accounts.id.initialize({
          client_id: this.GOOGLE_CLIENT_ID,
          callback: (response: CredentialResponse) => {
            try {
              console.log('[Auth] ✅ Usuario autenticado con Google')
              console.log('[Auth] 📝 Procesando credential...')
              callback(response.credential)
            } catch (callbackError) {
              console.error('[Auth] ❌ Error en callback de autenticación:', callbackError)
              console.error('[Auth] Stack:', callbackError instanceof Error ? callbackError.stack : 'No disponible')
              this.authState.error = 'Error procesando autenticación'
            }
          },
          ux_mode: 'popup',
          auto_select: false,
          error_callback: (error: any) => {
            // Este callback se dispara cuando Google rechaza el origen o hay error de configuración
            console.error('[Auth] ❌❌❌ ERROR CRÍTICO: Origen NO autorizado en Google Cloud Console')
            console.error('[Auth] 🌐 Origen bloqueado:', window.location.origin)
            console.error('[Auth] 🔑 Client ID:', this.GOOGLE_CLIENT_ID.substring(0, 20) + '...')
            console.error('[Auth] Error details:', error)
            console.error('[Auth] ')
            console.error('[Auth] 🔧 SOLUCIÓN RÁPIDA (5 minutos):')
            console.error('[Auth] 1️⃣ Ve a: https://console.cloud.google.com/apis/credentials')
            console.error('[Auth] 2️⃣ Busca el Client ID arriba en la lista de credenciales')
            console.error('[Auth] 3️⃣ Click en editar > "Authorized JavaScript origins"')
            console.error('[Auth] 4️⃣ Agrega:', window.location.origin)
            console.error('[Auth] 5️⃣ También agrega: http://127.0.0.1:5173 (si usas localhost)')
            console.error('[Auth] 6️⃣ Guarda y espera 1-2 minutos')
            console.error('[Auth] 7️⃣ Recarga esta página con Ctrl+Shift+R')
            console.error('[Auth] ')
            console.error('[Auth] 📚 Documentación: Ver docs/GOOGLE_ORIGIN_NOT_AUTHORIZED_FIX.md')
            this.authState.error = `Origen ${window.location.origin} no autorizado en Google Cloud Console. Ver consola para instrucciones.`
          }
        })
        console.log('[Auth] ✅ Google Sign-In inicializado')
      } catch (initError) {
        console.error('[Auth] ❌ Error al inicializar Google Sign-In:', initError)
        console.error('[Auth] Stack:', initError instanceof Error ? initError.stack : 'No disponible')
        console.error(`[Auth] 🌐 Origen: ${window.location.origin}`)
        console.error('[Auth] Client ID:', this.GOOGLE_CLIENT_ID.substring(0, 20) + '...')
        console.warn('[Auth] El origen puede no estar permitido en Google Cloud Console')
        throw initError
      }

      const container = document.getElementById(containerId)
      if (!container) {
        console.error(`[Auth] ❌ Contenedor #${containerId} no encontrado en el DOM`)
        console.error(`[Auth] Verifica que exista: <div id="${containerId}"></div>`)
        console.warn(`[Auth] HTML que busca: <div id="${containerId}"></div>`)
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
        console.log('[Auth] ✅ Botón de Google Sign-In renderizado exitosamente')
        console.log(`[Auth] 📍 Contenedor: #${containerId}`)
      } catch (renderError) {
        console.error('[Auth] ❌ Error al renderizar botón de Google Sign-In:', renderError)
        console.error('[Auth] Stack:', renderError instanceof Error ? renderError.stack : 'No disponible')
        console.error('[Auth] Contenedor:', container)
        console.warn('[Auth] El contenedor puede estar vacío o mal configurado')
        throw renderError
      }
    } catch (error) {
      console.error('[Auth] ❌ Error al inicializar Google Sign-In:', error)
      console.error('[Auth] Stack:', error instanceof Error ? error.stack : 'No disponible')
      console.error(`[Auth] 🌐 Origen actual: ${window.location.origin}`)
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
