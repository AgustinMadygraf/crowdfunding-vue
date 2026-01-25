<!--
Path: src/components/auth/GoogleAuthButton.vue
-->

<template>
  <div class="d-flex flex-column gap-3 align-items-center">
    <div 
      v-if="!isAuthenticated"
      id="google-signin-button"
      class="d-flex justify-content-center"
    ></div>
    
    <div 
      v-else
      class="d-flex align-items-center gap-3 p-3 bg-light rounded-2 w-100"
      style="max-width: 400px;"
    >
      <img 
        v-if="user?.avatar_url"
        :src="sanitizeAvatarUrl(user.avatar_url)"
        :alt="user.nombre"
        class="rounded-circle"
        width="48"
        height="48"
      >
      <div class="flex-grow-1">
        <p class="fw-semibold mb-0">{{ user?.nombre }}</p>
        <p class="text-muted small mb-0">{{ user?.email }}</p>
      </div>
      <button 
        @click="handleLogout"
        class="btn btn-danger btn-sm"
      >
        {{ content.auth.google.logoutLabel }}
      </button>
    </div>

    <div v-if="error" class="alert alert-danger py-2 px-3 w-100" style="max-width: 400px;">
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
import { content } from '@/infrastructure/content'

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
  isLoading.value = true
  error.value = null

  try {
    // Validar que el token esté disponible
    if (!token) {
      console.error('[GoogleAuthButton] Token de Google no disponible')
      throw new Error(content.auth.google.errors.missingToken)
    }
    
    try {
      const authenticatedUser = await authStore.loginWithGoogle(token)
      emit('auth-success', authenticatedUser)
    } catch (authError) {
      console.error('[GoogleAuthButton] Error en loginWithGoogle:', authError)
      throw authError
    }
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : content.auth.google.errors.unknownAuth
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
  try {
    try {
      authStore.logout()
    } catch (logoutError) {
      console.error('[GoogleAuthButton] Error en authService.logout():', logoutError)
      throw logoutError
    }
    
    error.value = null
    emit('logout')
  } catch (err) {
    const errorMessage = content.auth.google.errors.logoutFailed
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
    
    // Cargar usuario actual si ya está autenticado
    try {
      authStore.hydrateFromService()
      if (user.value) {
      } else {
      }
    } catch (getUserError) {
      console.error('[GoogleAuthButton] ❌ Error al sincronizar estado de auth:', getUserError)
      console.warn('[GoogleAuthButton] ⚠️ Continuando sin usuario previo')
    }

    // Si ya está autenticado, no inicializamos el botón para evitar warnings innecesarios
    if (isAuthenticated.value) {
      return
    }

    // Verificar configuración de Google
    let configInfo: ReturnType<typeof auth.getConfigInfo>
    try {
      configInfo = auth.getConfigInfo()
    } catch (configError) {
      console.error('[GoogleAuthButton] ❌ Error al obtener configuración:', configError)
      console.error('[GoogleAuthButton] Stack trace:', configError instanceof Error ? configError.stack : 'No disponible')
      error.value = content.auth.google.errors.oauthConfig
      return
    }

    if (!configInfo.configured) {
      const errorMsg = content.auth.google.errors.oauthMissing
      error.value = content.auth.google.errors.oauthMissingDetails
      console.error(`[GoogleAuthButton] ❌ ${errorMsg}`)
      console.error(`[GoogleAuthButton] Verifica que la variable VITE_GOOGLE_CLIENT_ID esté correctamente en .env`)
      console.error(`[GoogleAuthButton] Valor esperado: VITE_GOOGLE_CLIENT_ID=<client_id>.apps.googleusercontent.com`)
      return
    }

    let attempts = 0
    const maxAttempts = 100 // 10 segundos

    // Esperar a que Google Identity Services esté listo
    const checkGoogleReady = setInterval(() => {
      attempts++

      try {
        if (window.google?.accounts?.id) {
          clearInterval(checkGoogleReady)
          
          try {
            auth.initGoogleSignIn(
              props.buttonContainerId,
              handleGoogleCallback
            )
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
            error.value = auth.getAuthState().error || content.auth.google.errors.initFailed
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
          error.value = content.auth.google.errors.initTimeout
        }
      } catch (intervalError) {
        clearInterval(checkGoogleReady)
        console.error('[GoogleAuthButton] ❌ Error inesperado en checkGoogleReady:', intervalError)
        console.error('[GoogleAuthButton] Stack:', intervalError instanceof Error ? intervalError.stack : 'No disponible')
        error.value = content.auth.google.errors.initUnexpected
      }
    }, 100)
  } catch (err) {
    const errorMsg = 'Error inesperado en onMounted'
    console.error(`[GoogleAuthButton] ${errorMsg}:`, err)
    console.error('[GoogleAuthButton] Detalles:', err instanceof Error ? err.message : 'Error desconocido')
    error.value = content.auth.google.errors.mountUnexpected
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

