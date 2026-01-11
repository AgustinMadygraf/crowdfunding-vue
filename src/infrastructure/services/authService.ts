/**
 * Servicio de Autenticación con Google OAuth
 * Maneja login/logout y gestión de sesiones
 */

import type { User } from '@/domain/user'
// import type { Credentials } from '@/domain/user' // Eliminado: no existe export Credentials
import type { IAuthService, AuthState, MutableAuthState, GoogleAuthConfig, AuthServiceConfig } from './IAuthService'
import { getApiBaseUrl } from '@/config/api'
import { DefaultTokenStorage, type TokenStorage } from './auth/tokenStorage'
import { DefaultGoogleOAuthProvider, type GoogleOAuthProvider } from './auth/googleOAuthProvider'
import { Logger } from '@/infrastructure/logger'

interface GoogleAuthResponse {
  user_id: string
  email: string
  nombre: string
  avatar_url?: string
  auth_token: string
}

export class AuthService implements IAuthService {
  private authState: MutableAuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  }

  private readonly API_BASE_URL: string
  private readonly GOOGLE_CLIENT_ID: string
  private readonly TOKEN_STORAGE_KEY: string
  private readonly USER_STORAGE_KEY: string
  private loginAttempts: { timestamp: number }[] = []
  private readonly MAX_LOGIN_ATTEMPTS = 5
  private readonly LOGIN_TIMEOUT_MS = 60000 // 1 minuto
  private readonly storage: TokenStorage
  private readonly provider: GoogleOAuthProvider

  constructor(config?: AuthServiceConfig, deps?: { storage?: TokenStorage; provider?: GoogleOAuthProvider }) {
    // Aplicar configuración con fallback a variables de entorno
    this.API_BASE_URL = config?.apiBaseUrl || getApiBaseUrl()
    this.GOOGLE_CLIENT_ID = config?.googleClientId || import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
    this.TOKEN_STORAGE_KEY = config?.tokenStorageKey || 'auth_token'
    this.USER_STORAGE_KEY = config?.userStorageKey || 'auth_user'

    // Inicializar dependencias
    this.storage = deps?.storage ?? new DefaultTokenStorage(
      config?.tokenStorageKey || 'auth_token',
      config?.userStorageKey || 'auth_user'
    )
    this.provider = deps?.provider ?? new DefaultGoogleOAuthProvider()

    // Validar que el client_id esté configurado
    if (!this.GOOGLE_CLIENT_ID) {
      console.error('[Auth] ❌ VITE_GOOGLE_CLIENT_ID no está configurado en las variables de entorno')
      console.error('[Auth] Stack de ejecución iniciada en:', new Error().stack)
      console.warn('[Auth] 📋 Crea un archivo .env en la raíz del proyecto')
      console.warn('[Auth] 📋 Con contenido: VITE_GOOGLE_CLIENT_ID=tu_client_id_aqui.apps.googleusercontent.com')
      this.authState.error = 'Configuración de Google OAuth incompleta'
    } else {
      // Solo loguear client ID en desarrollo por seguridad
      if (import.meta.env.DEV) {
        console.log('[Auth] ✅ Google Client ID configurado correctamente')
        console.log('[Auth] 🔑 Client ID:', this.GOOGLE_CLIENT_ID.substring(0, 20) + '...')
      } else {
        console.log('[Auth] ✅ Google Client ID configurado correctamente')
      }
    }

    // Validar que API use HTTPS en producción
    if (import.meta.env.PROD && !this.API_BASE_URL.startsWith('https://')) {
      console.error('[Auth] 🚨 SEGURIDAD: API_BASE_URL debe usar HTTPS en producción')
      console.error('[Auth] URL actual:', this.API_BASE_URL)
      throw new Error('API must use HTTPS in production')
    }

    this.loadStoredAuth()
    this.loadGoogleScript()
  }

  /**
   * Decodifica un JWT y retorna su payload
   * @param token JWT en formato xxx.yyy.zzz
   * @returns Payload decodificado o null si no es JWT válido
   */
  private decodeJWT(token: string): any | null {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        console.warn('[Auth] ⚠️ Token no tiene formato JWT (esperado: 3 partes, recibido:', parts.length + ')')
        return null
      }

      // Decodificar payload (segunda parte)
      const payload = parts[1]
      // Reemplazar caracteres URL-safe de Base64
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )

      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error('[Auth] ❌ Error al decodificar JWT:', error)
      console.error('[Auth] Token (primeros 20 chars):', token.substring(0, 20) + '...')
      return null
    }
  }

  /**
   * Valida si un JWT ha expirado
   * @param token JWT a validar
   * @returns true si el token es válido y no expiró, false si expiró o no es JWT
   */
  private isTokenValid(token: string): boolean {
    const payload = this.decodeJWT(token)
    
    if (!payload) {
      console.warn('[Auth] ⚠️ No se pudo decodificar token para validar expiración')
      // Si no es JWT, asumir válido y dejar que backend decida (401)
      return true
    }

    // Verificar claim 'exp' (expiración en segundos Unix)
    if (!payload.exp) {
      console.warn('[Auth] ⚠️ JWT sin claim "exp"; no se puede validar expiración en frontend')
      return true // Asumir válido si no tiene exp
    }

    const now = Math.floor(Date.now() / 1000) // Timestamp actual en segundos
    const isExpired = now >= payload.exp

    if (isExpired) {
      const expiredDate = new Date(payload.exp * 1000).toLocaleString('es-AR')
      console.warn('[Auth] ⏰ Token expiró el', expiredDate)
      console.warn('[Auth] 🕐 Tiempo actual:', new Date().toLocaleString('es-AR'))
    } else {
      const expiresIn = payload.exp - now
      const minutesLeft = Math.floor(expiresIn / 60)
      console.log(`[Auth] ✅ Token válido (expira en ${minutesLeft} minutos)`)
    }

    return !isExpired
  }

  /**
   * Carga el script de Google Identity Services
   */
  private loadGoogleScript(): void {
    this.provider.loadScript()
  }

  /**
   * Inicia sesión con Google
   * @param token Token de ID de Google
   */
  async loginWithGoogle(token: string): Promise<User> {
    // Rate limiting: prevenir spam de intentos de login
    const now = Date.now()
    this.loginAttempts = this.loginAttempts.filter(attempt => now - attempt.timestamp < this.LOGIN_TIMEOUT_MS)
    
    if (this.loginAttempts.length >= this.MAX_LOGIN_ATTEMPTS) {
      const oldestAttempt = this.loginAttempts[0].timestamp
      const waitTime = Math.ceil((this.LOGIN_TIMEOUT_MS - (now - oldestAttempt)) / 1000)
      const errorMsg = `Demasiados intentos de login. Espera ${waitTime} segundos.`
      console.warn(`[Auth] 🚫 Rate limit alcanzado: ${this.loginAttempts.length} intentos en 1 minuto`)
      this.authState.error = errorMsg
      throw new Error(errorMsg)
    }
    
    this.loginAttempts.push({ timestamp: now })
    
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

      if (import.meta.env.DEV) {
        console.log(`[Auth] 📤 Enviando solicitud de autenticación a ${this.API_BASE_URL}/api/auth/google`)
        console.log(`[Auth] 🌐 Token length: ${token.length} caracteres`)
      }
      
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

        this.storage.save(user, data.auth_token)
        if (import.meta.env.DEV) {
        console.log('[Auth] 💾 Sesión guardada')
      }
      } catch (storageError) {
        console.warn('[Auth] ⚠️ Error al guardar en localStorage:', storageError)
        console.warn('[Auth] ⚠️ La sesión funcionará pero no será persistida en recarga')
      }

      if (import.meta.env.DEV) {
        console.log('[Auth] ✅ Usuario autenticado correctamente:', user.email)
      }

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

      this.storage.clear()
      console.log('[Auth] ✅ Sesión limpiada')

      // Revocar sesión de Google si está disponible
      try {
        this.provider.disableAutoSelect()
      } catch (googleError) {
        console.warn('[Auth] ⚠️ Error al revocar sesión de Google:', googleError)
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
      const { token, user } = this.storage.load()
      if (token && user) {
        // Validar que el token no haya expirado
        if (!this.isTokenValid(token)) {
          console.warn('[Auth] ❌ Token expirado, cerrando sesión...')
          this.logout()
          return
        }
        this.authState.user = user
        this.authState.token = token
        this.authState.isAuthenticated = true
        if (import.meta.env.DEV) {
          console.log('[Auth] ✅ Sesión restaurada')
          console.log('[Auth] 👤 Usuario:', this.authState.user?.email)
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
   * Refresca el token JWT de forma silenciosa antes de que expire
   * Se ejecuta proactivamente 5 minutos antes de la expiración
   */
  private async silentRefresh(): Promise<boolean> {
    if (!this.authState.token) {
      console.warn('[Auth] ⚠️ No hay token disponible para refrescar')
      return false
    }

    try {
      if (import.meta.env.DEV) {
        console.log('[Auth] 🔄 Iniciando refresh silencioso de token...')
      }

      const response = await fetch(`${this.API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ token: this.authState.token })
      })

      if (!response.ok) {
        if (response.status === 401) {
          console.warn('[Auth] ❌ Token refresh rechazado (401). Sesión expirada.')
          this.logout()
          return false
        }
        throw new Error(`Refresh falló: ${response.status}`)
      }

      const data = (await response.json()) as { auth_token: string }
      const newToken = data.auth_token

      // Validar nuevo token
      if (!newToken || newToken.trim() === '') {
        console.error('[Auth] ❌ Backend retornó token vacío')
        return false
      }

      // Actualizar token en estado y storage
      this.authState.token = newToken
      if (this.authState.user) {
        this.storage.save(this.authState.user, newToken)
      }

      if (import.meta.env.DEV) {
        const payload = this.decodeJWT(newToken)
        const expiresIn = payload?.exp ? payload.exp - Math.floor(Date.now() / 1000) : 0
        const minutesLeft = Math.floor(expiresIn / 60)
        console.log(`[Auth] ✅ Token refrescado (expira en ${minutesLeft} minutos)`)
      }

      return true
    } catch (error) {
      console.error('[Auth] ❌ Error al refrescar token:', error)
      this.logout()
      return false
    }
  }

  /**
   * Verifica si el token está próximo a expirar y lo refresca si es necesario
   * Se debe llamar antes de operaciones críticas
   */
  async refreshTokenIfNeeded(): Promise<boolean> {
    if (!this.authState.token || !this.authState.isAuthenticated) {
      return false
    }

    const payload = this.decodeJWT(this.authState.token)
    if (!payload?.exp) {
      return false
    }

    const now = Math.floor(Date.now() / 1000)
    const expiresIn = payload.exp - now
    const REFRESH_THRESHOLD = 300 // 5 minutos en segundos

    // Si el token expira en menos de 5 minutos, refrescar
    if (expiresIn < REFRESH_THRESHOLD) {
      if (import.meta.env.DEV) {
        const minutesLeft = Math.floor(expiresIn / 60)
        console.log(`[Auth] ⏰ Token expirará en ${minutesLeft}m, refrescando...`)
      }
      return await this.silentRefresh()
    }

    return true // Token aún válido
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
      if (!this.provider.isReady()) {
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
        this.provider.initialize(
          this.GOOGLE_CLIENT_ID,
          (cred) => {
            try {
              console.log('[Auth] ✅ Usuario autenticado con Google')
              console.log('[Auth] 📝 Procesando credential...')
              callback(cred)
            } catch (callbackError) {
              console.error('[Auth] ❌ Error en callback de autenticación:', callbackError)
              console.error('[Auth] Stack:', callbackError instanceof Error ? callbackError.stack : 'No disponible')
              this.authState.error = 'Error procesando autenticación'
            }
          },
          (error: any) => {
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
        )
        console.log('[Auth] ✅ Google Sign-In inicializado')
        console.log('[Auth] 🔍 Esperando respuesta de Google... (el error 403 puede aparecer ahora)')
        
        // Monitorear errores de red de Google después de inicializar
        setTimeout(() => {
          if (this.authState.error && this.authState.error.includes('no autorizado')) {
            console.error('[Auth] ⚠️ Si ves error 403 en Network tab:')
            console.error('[Auth] → El origen NO está en Google Cloud Console')
            console.error('[Auth] → Ver docs/GOOGLE_ORIGIN_NOT_AUTHORIZED_FIX.md para solución')
          }
        }, 2000)
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
        this.provider.renderButton(container)
        console.log('[Auth] ✅ Botón de Google Sign-In renderizado exitosamente')
        console.log(`[Auth] 📍 Contenedor: #${containerId}`)
        console.log('[Auth] 🔎 Verificando iframe de Google... (revisar Network tab para 403)')
        
        // Variable para rastrear si se detectó el error 403
        let error403Detected = false
        let gsiLoggerDetected = false
        
        // Capturar mensajes de error específicos de GSI
        const originalConsoleError = console.error
        const checkForGSIError = (...args: any[]) => {
          const msg = args.join(' ')
          if (msg.includes('GSI') || msg.includes('gsi')) {
            if (msg.includes('origin') && msg.includes('not allowed')) {
              gsiLoggerDetected = true
            }
          }
        }
        
        // Monitorear errores de red en el Performance API
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name.includes('accounts.google.com') && 
                (entry as any).responseStatus === 403) {
              error403Detected = true
            }
          }
        })
        
        try {
          observer.observe({ entryTypes: ['resource'] })
        } catch (e) {
          // Performance API no disponible o no soportado
        }
        
        // Verificar estado después de renderizar
        setTimeout(() => {
          observer.disconnect()
          
          // Buscar iframes de Google en el DOM
          const googleIframes = document.querySelectorAll('iframe[src*="accounts.google.com"], iframe[id*="gsi"]')
          const hasButton = container.querySelector('iframe, div[role="button"]')
          
          console.log('[Auth] 🔍 Estado del Google Sign-In:')
          console.log('[Auth]   - Iframes encontrados:', googleIframes.length)
          console.log('[Auth]   - Botón renderizado:', !!hasButton)
          console.log('[Auth]   - GSI_LOGGER detectó error:', gsiLoggerDetected)
          
          // Solo mostrar diagnóstico si:
          // 1. No hay iframe en absoluto O
          // 2. Se detectó GSI_LOGGER con error de origin
          if (googleIframes.length === 0 || gsiLoggerDetected) {
            console.error('[Auth] ')
            console.error('[Auth] ❌❌❌ ERROR DETECTADO: Posible problema de origen')
            console.error('[Auth] ')
            console.error('[Auth] 📋 INFORMACIÓN:')
            console.error('[Auth]   🌐 Origin actual: ', window.location.origin)
            console.error('[Auth]   🔑 Client ID: ' + this.GOOGLE_CLIENT_ID)
            if (gsiLoggerDetected) {
              console.error('[Auth]   ⚠️  GSI_LOGGER reportó: origin not allowed')
            }
            if (googleIframes.length === 0) {
              console.error('[Auth]   ⚠️  No se encontraron iframes de Google en el DOM')
            }
            console.error('[Auth] ')
            console.error('[Auth] 🔧 VERIFICACIONES (en orden):')
            console.error('[Auth] ')
            console.error('[Auth] 1️⃣ Confirmar que el origen está en Google Cloud Console')
            console.error('[Auth]    ▪ URL: https://console.cloud.google.com/apis/credentials')
            console.error('[Auth]    ▪ Busca Client ID: ' + this.GOOGLE_CLIENT_ID)
            console.error('[Auth]    ▪ Verifica "Authorized JavaScript origins" incluye:')
            console.error('[Auth]       - http://localhost:5173')
            console.error('[Auth]       - http://localhost')
            console.error('[Auth]       - http://127.0.0.1:5173')
            console.error('[Auth]       - http://127.0.0.1')
            console.error('[Auth]    ▪ Presiona SAVE y espera 1-2 minutos')
            console.error('[Auth] ')
            console.error('[Auth] 2️⃣ Verificar que el header Referer se envía')
            console.error('[Auth]    ▪ Chrome DevTools → Network → gsi/button')
            console.error('[Auth]    ▪ Revisa Request Headers → Referer')
            console.error('[Auth]    ▪ Debería mostrar: http://localhost:5173/...')
            console.error('[Auth] ')
            console.error('[Auth] 3️⃣ Si persiste, prueba hard reload')
            console.error('[Auth]    ▪ Ctrl+Shift+R (Windows) o Cmd+Shift+R (Mac)')
            console.error('[Auth] ')
            console.error('[Auth] 📚 Guía completa: docs/GOOGLE_403_TROUBLESHOOTING_COMPLETE.md')
          } else {
            console.log('[Auth] ✅ Google Sign-In iframe cargado exitosamente')
            console.log('[Auth] 💡 Si el login no funciona, revisa:')
            console.log('[Auth]    - ¿Está Google OAuth Consent Screen en "Testing"?')
            console.log('[Auth]    - ¿Tu cuenta de Gmail está como "Test user"?')
            console.log('[Auth]    - ¿El popup de login se abre al clickear?')
          }
        }, 3000)
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

// Exportar clase y tipos
export type { User, GoogleAuthResponse }
export type { IAuthService, IAuthQuery, IAuthCommand, AuthState, MutableAuthState, GoogleAuthConfig, AuthServiceConfig } from './IAuthService'

// Ajustar tipo de credentials si es necesario
export async function authenticateUser(credentials: any) {
  try {
    // ...existing code...
  } catch (error) {
    Logger.error('Error autenticando usuario', error)
    throw error
  }
}
