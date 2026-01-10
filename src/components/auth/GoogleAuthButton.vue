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
        :src="user.avatar_url"
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
import { authService } from '@/infrastructure/services/authService'
import type { User } from '@/domain/user'

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

const user = ref<User | null>(null)
const error = ref<string | null>(null)
const isLoading = ref(false)

const isAuthenticated = computed(() => authService.isAuthenticated())

/**
 * Maneja el callback de Google Sign-In
 */
const handleGoogleCallback = async (token: string) => {
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
      const authenticatedUser = await authService.loginWithGoogle(token)
      user.value = authenticatedUser
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
  }
}

/**
 * Maneja el logout
 */
const handleLogout = () => {
  console.log('[GoogleAuthButton] Iniciando cierre de sesión')
  try {
    try {
      authService.logout()
    } catch (logoutError) {
      console.error('[GoogleAuthButton] Error en authService.logout():', logoutError)
      throw logoutError
    }
    
    user.value = null
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
    
    // Cargar usuario actual si ya está autenticado
    try {
      user.value = authService.getCurrentUser()
      if (user.value) {
        console.log('[GoogleAuthButton] Usuario autenticado encontrado:', user.value.email)
      } else {
        console.log('[GoogleAuthButton] No hay usuario autenticado previamente')
      }
    } catch (getUserError) {
      console.error('[GoogleAuthButton] Error al obtener usuario actual:', getUserError)
      console.warn('[GoogleAuthButton] Continuando sin usuario previo')
    }

    // Verificar configuración de Google
    let configInfo: ReturnType<typeof authService.getConfigInfo>
    try {
      configInfo = authService.getConfigInfo()
      console.log('[GoogleAuthButton] Configuración de Google:', configInfo)
    } catch (configError) {
      console.error('[GoogleAuthButton] Error al obtener configuración:', configError)
      error.value = 'Error al verificar configuración de Google OAuth'
      return
    }

    if (!configInfo.configured) {
      const errorMsg = 'Google OAuth no está configurado'
      error.value = `${errorMsg}. Por favor, configura VITE_GOOGLE_CLIENT_ID en el archivo .env`
      console.error(`[GoogleAuthButton] ${errorMsg}`)
      console.warn('[GoogleAuthButton] Verifica que la variable VITE_GOOGLE_CLIENT_ID esté en .env')
      return
    }

    let attempts = 0
    const maxAttempts = 100 // 10 segundos

    console.log('[GoogleAuthButton] Esperando que Google Identity Services esté listo...')

    // Esperar a que Google Identity Services esté listo
    const checkGoogleReady = setInterval(() => {
      attempts++

      if (window.google?.accounts?.id) {
        clearInterval(checkGoogleReady)
        console.log('[GoogleAuthButton] Google SDK listo en intento', attempts)
        console.log('[GoogleAuthButton] Inicializando Google Sign-In...')
        
        try {
          authService.initGoogleSignIn(
            props.buttonContainerId,
            handleGoogleCallback
          )
          console.log('[GoogleAuthButton] Google Sign-In inicializado correctamente')
        } catch (initError) {
          console.error('[GoogleAuthButton] Error al inicializar Google Sign-In:', initError)
          console.error('[GoogleAuthButton] Detalles:', initError instanceof Error ? initError.message : 'Error desconocido')
          console.warn('[GoogleAuthButton] Posibles causas: origen no autorizado, Client ID incorrecto, CORS')
          error.value = 'Error al inicializar Google Sign-In. Verifica la consola para más detalles.'
        }
      } else if (attempts >= maxAttempts) {
        clearInterval(checkGoogleReady)
        const timeoutMsg = 'Timeout: Google Identity Services no se cargó en 10 segundos'
        console.error(`[GoogleAuthButton] ${timeoutMsg}`)
        console.warn('[GoogleAuthButton] Verifica tu conexión a internet')
        console.warn('[GoogleAuthButton] Verifica que accounts.google.com sea accesible')
        error.value = 'No se pudo cargar Google Sign-In. Verifica tu conexión a internet.'
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
