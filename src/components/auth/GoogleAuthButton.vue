<template>
  <div class="google-auth-container">
    <div 
      v-if="!isAuthenticated"
      id="google-signin-button"
      class="google-button-wrapper"
    ></div>
    
    <div 
      v-else
      class="user-profile"
    >
      <img 
        v-if="user?.avatar_url"
        :src="sanitizeAvatarUrl(user.avatar_url)"
        :alt="user.nombre"
        class="avatar"
      >
      <div class="user-info">
        <p class="user-name">{{ user?.nombre }}</p>
        <p class="user-email">{{ user?.email }}</p>
      </div>
      <button 
        @click="handleLogout"
        class="logout-button"
      >
        Cerrar sesión
      </button>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthService } from '@/application/useAuthService'
import type { User } from '@/domain/user'
import { sanitizeAvatarUrl } from '@/utils/urlSanitizer'
import { useAuthStore } from '@/stores/authStore'

const props = defineProps({
  buttonContainerId: {
    type: String,
    default: 'google-signin-button'
  }
})

const emit = defineEmits<{
  'auth-success': [user: User]
  'auth-error': [error: Error]
  'logout': []
}>()

const authStore = useAuthStore()
const user = computed(() => authStore.user)
const error = ref<string | null>(null)
const isLoading = ref(false)

const auth = useAuthService()
const isAuthenticated = computed(() => authStore.isAuthenticated)

// Debounce/throttle state para prevenir múltiples llamadas simultáneas
let authInProgress = false
let lastAuthAttempt = 0
const MIN_AUTH_INTERVAL_MS = 2000 // Mínimo 2 segundos entre intentos

/**
 * Maneja el callback de Google Sign-In con throttling
 */
const handleGoogleCallback = async (token: string) => {
  // Throttle: prevenir llamadas muy rápidas
  const now = Date.now()
  if (now - lastAuthAttempt < MIN_AUTH_INTERVAL_MS) {
    console.warn('[GoogleAuthButton] ⏱️ Throttle activo: intento muy rápido, ignorando')
    return
  }
  
  // Prevenir autenticación concurrente
  if (authInProgress) {
    console.warn('[GoogleAuthButton] ⏳ Autenticación ya en progreso, ignorando callback duplicado')
    return
  }
  
  authInProgress = true
  lastAuthAttempt = now
  console.log('[GoogleAuthButton] Callback recibido de Google')
  isLoading.value = true
  error.value = null

  try {
    // Validar que el token esté disponible
    if (!token) {
      console.error('[GoogleAuthButton] Token de Google no disponible')
      throw new Error('No se recibió token de Google')
    }

    console.log('[GoogleAuthButton] Intentando autenticar usuario...')
    
    try {
      const authenticatedUser = await authStore.loginWithGoogle(token)
      console.log('[GoogleAuthButton] Autenticación exitosa:', authenticatedUser.email)
      emit('auth-success', authenticatedUser)
    } catch (authError) {
      console.error('[GoogleAuthButton] Error en loginWithGoogle:', authError)
      throw authError
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error de autenticación desconocido'
    console.error('[GoogleAuthButton] Error en callback de autenticación:', errorMessage)
    console.error('[GoogleAuthButton] Detalles del error:', err)
    console.warn('[GoogleAuthButton] Posibles causas: CORS, servidor no disponible, Client ID incorrecto')
    error.value = errorMessage
    emit('auth-error', err instanceof Error ? err : new Error(errorMessage))
  } finally {
    isLoading.value = false
    authInProgress = false
  }
}

/**
 * Maneja el logout con validación
 */
const handleLogout = () => {
  // Prevenir logout durante autenticación
  if (authInProgress) {
    console.warn('[GoogleAuthButton] ⚠️ No se puede cerrar sesión durante autenticación en progreso')
    return
  }
  
  console.log('[GoogleAuthButton] Iniciando cierre de sesión')
  try {
    try {
      authStore.logout()
    } catch (logoutError) {
      console.error('[GoogleAuthButton] Error en authService.logout():', logoutError)
      throw logoutError
    }
    
    error.value = null
    emit('logout')
    console.log('[GoogleAuthButton] Sesión cerrada exitosamente')
  } catch (err) {
    const errorMessage = 'Error al cerrar sesión'
    console.error('[GoogleAuthButton] Error en logout:', err)
    console.error('[GoogleAuthButton] Detalles:', err instanceof Error ? err.message : 'Error desconocido')
    error.value = errorMessage
  }
}

/**
 * Inicializa Google Sign-In cuando se monta el componente
 */
onMounted(() => {
  try {
    console.log('[GoogleAuthButton] Montando componente de autenticación')
    console.log(`[GoogleAuthButton] 🌐 Origen actual: ${window.location.origin}`)
    console.log(`[GoogleAuthButton] 📍 URL completa: ${window.location.href}`)
    
    // Cargar usuario actual si ya está autenticado
    try {
      authStore.hydrateFromService()
      if (user.value) {
        console.log('[GoogleAuthButton] ✓ Usuario autenticado encontrado:', user.value.email)
      } else {
        console.log('[GoogleAuthButton] ⚠️ No hay usuario autenticado previamente')
      }
    } catch (getUserError) {
      console.error('[GoogleAuthButton] ❌ Error al sincronizar estado de auth:', getUserError)
      console.warn('[GoogleAuthButton] ⚠️ Continuando sin usuario previo')
    }

    // Si ya está autenticado, no inicializamos el botón para evitar warnings innecesarios
    if (isAuthenticated.value) {
      console.log('[GoogleAuthButton] Usuario ya autenticado; se omite la inicialización de Google Sign-In')
      return
    }

    // Verificar configuración de Google
    let configInfo: ReturnType<typeof auth.getConfigInfo>
    try {
      configInfo = auth.getConfigInfo()
      console.log('[GoogleAuthButton] ✅ Configuración de Google:', configInfo)
      console.log('[GoogleAuthButton] 🌐 Origen:', window.location.origin)
    } catch (configError) {
      console.error('[GoogleAuthButton] ❌ Error al obtener configuración:', configError)
      console.error('[GoogleAuthButton] Stack trace:', configError instanceof Error ? configError.stack : 'No disponible')
      error.value = 'Error al verificar configuración de Google OAuth'
      return
    }

    if (!configInfo.configured) {
      const errorMsg = 'Google OAuth no está configurado'
      error.value = `${errorMsg}. Por favor, configura VITE_GOOGLE_CLIENT_ID en el archivo .env`
      console.error(`[GoogleAuthButton] ❌ ${errorMsg}`)
      console.error(`[GoogleAuthButton] Verifica que la variable VITE_GOOGLE_CLIENT_ID esté correctamente en .env`)
      console.error(`[GoogleAuthButton] Valor esperado: VITE_GOOGLE_CLIENT_ID=<client_id>.apps.googleusercontent.com`)
      return
    }

    let attempts = 0
    const maxAttempts = 100 // 10 segundos

    console.log('[GoogleAuthButton] ⏳ Esperando que Google Identity Services esté listo...')
    console.log('[GoogleAuthButton] window.google disponible:', !!window.google)
    console.log('[GoogleAuthButton] window.google.accounts disponible:', !!window.google?.accounts)

    // Esperar a que Google Identity Services esté listo
    const checkGoogleReady = setInterval(() => {
      attempts++

      try {
        if (window.google?.accounts?.id) {
          clearInterval(checkGoogleReady)
          console.log(`[GoogleAuthButton] ✅ Google SDK listo en intento ${attempts}`)
          console.log('[GoogleAuthButton] Inicializando Google Sign-In...')
          
          try {
            auth.initGoogleSignIn(
              props.buttonContainerId,
              handleGoogleCallback
            )
            console.log('[GoogleAuthButton] ✅ Google Sign-In inicializado correctamente')
          } catch (initError) {
            console.error('[GoogleAuthButton] ❌ Error al inicializar Google Sign-In:', initError)
            console.error('[GoogleAuthButton] Mensaje:', initError instanceof Error ? initError.message : 'Error desconocido')
            console.error('[GoogleAuthButton] Stack:', initError instanceof Error ? initError.stack : 'No disponible')
            console.error(`[GoogleAuthButton] 🌐 Origen actual: ${window.location.origin}`)
            console.error('[GoogleAuthButton] Posibles causas: ')
            console.error('  1️⃣ Origen NO autorizado en Google Cloud Console (más probable)')
            console.error('  2️⃣ Client ID incorrecto o expirado')
            console.error('  3️⃣ Problemas de red o CORS')
            console.error('[GoogleAuthButton] 📚 Si ves "403" o "GSI_LOGGER: origin not allowed" → Ver docs/GOOGLE_ORIGIN_NOT_AUTHORIZED_FIX.md')
            error.value = auth.getAuthState().error || 'Error al inicializar Google Sign-In. Ver consola para detalles.'
          }
        } else if (attempts >= maxAttempts) {
          clearInterval(checkGoogleReady)
          const timeoutMsg = 'Timeout: Google Identity Services no se cargó en 10 segundos'
          console.error(`[GoogleAuthButton] ⏱️ ${timeoutMsg}`)
          console.error('[GoogleAuthButton] window.google:', window.google)
          console.error('[GoogleAuthButton] window.google.accounts:', window.google?.accounts)
          console.warn('[GoogleAuthButton] Soluciones: ')
          console.warn('  1️⃣ Verifica tu conexión a internet')
          console.warn('  2️⃣ Verifica que accounts.google.com sea accesible')
          console.warn('  3️⃣ Intenta recargar la página')
          console.warn('  4️⃣ Comprueba la consola del navegador (F12) para otros errores')
          error.value = 'No se pudo cargar Google Sign-In. Verifica tu conexión a internet.'
        }
      } catch (intervalError) {
        clearInterval(checkGoogleReady)
        console.error('[GoogleAuthButton] ❌ Error inesperado en checkGoogleReady:', intervalError)
        console.error('[GoogleAuthButton] Stack:', intervalError instanceof Error ? intervalError.stack : 'No disponible')
        error.value = 'Error inesperado al inicializar Google Sign-In'
      }
    }, 100)
  } catch (err) {
    const errorMsg = 'Error inesperado en onMounted'
    console.error(`[GoogleAuthButton] ${errorMsg}:`, err)
    console.error('[GoogleAuthButton] Detalles:', err instanceof Error ? err.message : 'Error desconocido')
    error.value = 'Error al inicializar el componente de autenticación'
  }
})
watch(error, (newError) => {
  if (newError) {
    setTimeout(() => {
      error.value = null
    }, 5000)
  }
})
</script>

<style scoped lang="css">
.google-auth-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.google-button-wrapper {
  display: flex;
  justify-content: center;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--color-background-soft);
  border-radius: 0.5rem;
  width: 100%;
  max-width: 400px;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info {
  flex: 1;
}

.user-name {
  font-weight: 600;
  margin: 0;
  color: var(--color-text);
}

.user-email {
  font-size: 0.875rem;
  margin: 0.25rem 0 0;
  color: var(--color-text-secondary);
}

.logout-button {
  padding: 0.5rem 1rem;
  background: var(--color-danger);
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.2s;
}

.logout-button:hover {
  background: var(--color-danger-darker);
}

.error-message {
  padding: 0.75rem;
  background: #fee;
  color: #c00;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  width: 100%;
  max-width: 400px;
}
</style>
