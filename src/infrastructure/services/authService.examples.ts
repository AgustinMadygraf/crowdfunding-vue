/**
 * Ejemplos de uso de AuthService Factory Pattern
 * 
 * Este archivo documenta cómo usar createAuthService() para diferentes escenarios
 */

import { provide, type App, inject } from 'vue'
import { createAuthService, authService } from '@/infrastructure/services/authServiceFactory'
import { authService as barrelAuth } from '@/infrastructure/services'
import type { IAuthService } from '@/infrastructure/services/IAuthService'

// ======================
// 1. USO BÁSICO (Singleton por defecto)
// ======================

// Importar singleton configurado con variables de entorno
// Este es el uso recomendado para la mayoría de los componentes
// import { authService } from '@/infrastructure/services/authServiceFactory'

// O desde el barrel export
// import { authService as barrelAuth } from '@/infrastructure/services'

// Ambos son la misma instancia

// ======================
// 2. TESTING - Mock de AuthService
// ======================

// Crear instancia con configuración personalizada para tests
const testAuthService = createAuthService({
  apiBaseUrl: 'http://test-api.local:3000',
  googleClientId: 'test-client-id.apps.googleusercontent.com',
  tokenStorageKey: 'test_auth_token',
  userStorageKey: 'test_auth_user'
})

// Usar en pruebas unitarias (ejemplo con Jest/Vitest)
/*
describe('Component with Auth', () => {
  it('should login with test credentials', async () => {
    const testAuth = createAuthService({
      apiBaseUrl: 'http://mock-api.test'
    })
    
    // Test login...
  })
})
*/

// ======================
// 3. MÚLTIPLES ENTORNOS
// ======================

// Desarrollo local (usa mocks)
const devAuthService = createAuthService({
  apiBaseUrl: 'http://localhost:5000'
})

// Staging
const stagingAuthService = createAuthService({
  apiBaseUrl: 'https://api-staging.madypack.com.ar'
})

// Producción (HTTPS requerido)
const prodAuthService = createAuthService({
  apiBaseUrl: 'https://api.madypack.com.ar',
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID_PROD
})

// ======================
// 4. VUE PROVIDE/INJECT (Próxima mejora)
// ======================

// En App.vue o plugin de Vue
// import { provide, type App } from 'vue'

export function installAuth(app: App) {
  const auth = createAuthService()
  app.provide('authService', auth)
}

// En componentes
// import { inject } from 'vue'
// import type { IAuthService } from '@/infrastructure/services/IAuthService'

export default {
  setup() {
    const auth = inject<IAuthService>('authService')
    if (!auth) {
      throw new Error('AuthService not provided')
    }
    
    // Usar auth...
  }
}

// ======================
// 5. CAMBIO DE STORAGE (e.g., sessionStorage)
// ======================

// Crear servicio que usa sessionStorage en lugar de localStorage
// (Requiere extender AuthService para soportar storage customizable)
const sessionAuthService = createAuthService({
  tokenStorageKey: 'session_auth_token',
  userStorageKey: 'session_auth_user'
})

// Nota: Actualmente AuthService usa localStorage hardcodeado
// Para sessionStorage, necesitaría:
// 1. Inyectar StorageProvider en constructor
// 2. Usar this.storage.setItem() en lugar de localStorage.setItem()

// ======================
// 6. MÚLTIPLES CUENTAS (Futuro)
// ======================

// Crear múltiples instancias para diferentes cuentas de usuario
const personalAuth = createAuthService({
  tokenStorageKey: 'personal_token',
  userStorageKey: 'personal_user'
})

const businessAuth = createAuthService({
  tokenStorageKey: 'business_token',
  userStorageKey: 'business_user'
})

// ======================
// 7. DEBUGGING - Configuración custom
// ======================

// Crear instancia con logging habilitado (futuro)
const debugAuthService = createAuthService({
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  // logLevel: 'debug', // Requiere implementar logging configurable
})

// ======================
// BENEFICIOS DEL FACTORY PATTERN
// ======================

/*
✅ TESTABILITY
  - Inyectar mocks fácilmente sin modificar código de producción
  - Cada test puede tener su propia instancia aislada
  
✅ CONFIGURABILIDAD
  - Diferentes instancias para diferentes entornos
  - Sobrescribir solo los valores necesarios
  
✅ DEPENDENCY INJECTION
  - Base para Vue provide/inject
  - Facilita future refactoring
  
✅ SINGLE RESPONSIBILITY
  - Factory se encarga de construcción
  - AuthService se enfoca en lógica de negocio
  
✅ OPEN/CLOSED PRINCIPLE
  - Extensible sin modificar AuthService
  - Agregar nuevas configuraciones es trivial
*/

// ======================
// MIGRACIÓN DESDE CÓDIGO EXISTENTE
// ======================

// ANTES (importación directa del singleton):
// import { authService } from '@/infrastructure/services/authService'

// DESPUÉS (usando factory - RECOMENDADO):
// import { createAuthService } from '@/infrastructure/services/authServiceFactory'
// const authService = createAuthService()

// O mantener importación existente (funciona igual):
// import { authService } from '@/infrastructure/services/authService'
// ↑ Esto ahora usa la instancia creada por la factory internamente

export {
  devAuthService,
  stagingAuthService,
  prodAuthService,
  testAuthService
}
