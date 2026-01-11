# 🔐 Token Storage Migration - sessionStorage + httpOnly Cookies

## Overview

Migración de almacenamiento de tokens JWT de `localStorage` (vulnerable a XSS) a estrategias más seguras con `sessionStorage` (frontend) y cookies `httpOnly` (backend).

## Cambios Implementados (Frontend)

### Token Storage Strategies

Se han implementado 3 estrategias de almacenamiento, seleccionables según necesidad:

#### 1. **DefaultTokenStorage** (DEPRECATED) ❌
```typescript
// Almacena en localStorage - VULNERABLE A XSS
const storage = new DefaultTokenStorage('auth_token', 'auth_user')
```

**Problemas:**
- localStorage persiste entre sesiones y pestañas
- Vulnerable a XSS (token legible por JS)
- No se limpia al cerrar el navegador
- Requiere limpieza manual en logout

---

#### 2. **SessionStorageTokenStorage** (RECOMENDADO) ✅
```typescript
// Almacena en sessionStorage - SEGURO POR DEFECTO
const storage = new SessionStorageTokenStorage('auth_token', 'auth_user')
```

**Ventajas:**
- ✅ Se limpia automáticamente al cerrar pestaña
- ✅ No persiste entre sesiones
- ✅ Mejor protección contra XSS
- ✅ Token aún accesible en JS si es necesario
- ✅ Mejor que localStorage

**Desventajas:**
- ❌ Sesión se pierde si usuario recarga página
- ❌ No es ideal para "persistencia de sesión"

**Estado:** ✅ **ACTIVO POR DEFECTO EN PRODUCTION**

---

#### 3. **MemoryOnlyTokenStorage** (MÁXIMA SEGURIDAD) 🔐
```typescript
// Almacena SOLO en memoria - MÁXIMA SEGURIDAD
const storage = new MemoryOnlyTokenStorage()
```

**Ventajas:**
- ✅ Token NUNCA toca storage (JS)
- ✅ Máxima protección contra XSS
- ✅ Cookies httpOnly son la única persistencia
- ✅ Imposible de exfiltrar vía JS

**Desventajas:**
- ❌ Token se pierde completamente al recargar página
- ❌ Requiere backend con refresh token robusto
- ❌ Peor UX (fuerza re-login después refresh)

**Estado:** ⏳ **FUTURO: Cuando backend implemente httpOnly cookies**

**Usar cuando:**
```typescript
// Backend proporciona httpOnly JWT cookies
import { MemoryOnlyTokenStorage } from '@/infrastructure/services/auth/tokenStorage'

const storage = new MemoryOnlyTokenStorage()
const authService = new AuthService(config, { storage })
```

---

## Arquitectura

### Flujo Actual (SessionStorage)

```
┌─────────────────────────────────────────────────────────┐
│ 1. Usuario hace login                                    │
│    POST /api/auth/login                                  │
│    { email: ..., password: ... }                        │
└─────────────────────────────────────────────────────────┘
                         ⬇
┌─────────────────────────────────────────────────────────┐
│ 2. Backend responde con JWT                             │
│    Response:                                             │
│    {                                                     │
│      "auth_token": "eyJ...",                            │
│      "user": { id, email, nombre }                      │
│    }                                                     │
└─────────────────────────────────────────────────────────┘
                         ⬇
┌─────────────────────────────────────────────────────────┐
│ 3. AuthService almacena en sessionStorage                │
│    sessionStorage.setItem('auth_token', jwt)            │
│    sessionStorage.setItem('auth_user', user)            │
│    ✅ Se limpia al cerrar pestaña                       │
│    ✅ No persiste entre sesiones                        │
└─────────────────────────────────────────────────────────┘
                         ⬇
┌─────────────────────────────────────────────────────────┐
│ 4. Requests posteriores incluyen token                   │
│    GET /api/contributions                               │
│    Headers: Authorization: Bearer {jwt}                 │
│    (leer de sessionStorage)                             │
└─────────────────────────────────────────────────────────┘
```

### Flujo Futuro (httpOnly Cookies + Memory Storage)

```
┌─────────────────────────────────────────────────────────┐
│ 1. Usuario hace login                                    │
│    POST /api/auth/login                                  │
│    { email: ..., password: ... }                        │
└─────────────────────────────────────────────────────────┘
                         ⬇
┌─────────────────────────────────────────────────────────┐
│ 2. Backend responde con JWT en httpOnly cookie          │
│    Set-Cookie: jwt=eyJ...; HttpOnly; Secure; SameSite  │
│    Response: { user: { id, email, nombre } }           │
│    ⚠️ Frontend NUNCA VE el token (envuelto por browser) │
└─────────────────────────────────────────────────────────┘
                         ⬇
┌─────────────────────────────────────────────────────────┐
│ 3. AuthService usa MemoryOnlyTokenStorage                │
│    Token NUNCA se almacena en JS                        │
│    Solo almacena user info en memoria                   │
│    if (import.meta.env.VITE_USE_HTTPONLY_COOKIES) {    │
│      storage = new MemoryOnlyTokenStorage()             │
│    }                                                     │
└─────────────────────────────────────────────────────────┘
                         ⬇
┌─────────────────────────────────────────────────────────┐
│ 4. Navegador envía cookie automáticamente                │
│    GET /api/contributions                               │
│    Cookie: jwt=eyJ...  ← navegador lo envía automático  │
│    (credentials: 'include' en fetch)                    │
│    ✅ Frontend nunca ve el token                        │
│    ✅ Máxima protección contra XSS                      │
└─────────────────────────────────────────────────────────┘
```

---

## Cambios en API Client

El `ApiClient` ya soporta credentials automáticamente:

```typescript
// src/infrastructure/api.ts
async post<T>(endpoint: string, data?: unknown): Promise<T> {
  return this.retryWithBackoff(async () => {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getMutatingHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include' // ✅ Incluye cookies automáticamente
    })
    return this.handleResponse<T>(response)
  })
}
```

Con `credentials: 'include'`:
- Cookies se envían con requests cross-origin
- Backend puede leer cookie httpOnly
- Frontend no necesita hacer nada especial

---

## Cambios en AuthService

### Antes (localStorage)
```typescript
const storage = new DefaultTokenStorage('auth_token', 'auth_user')
// ❌ Token persiste indefinidamente
// ❌ Vulnerable a XSS
```

### Después (sessionStorage)
```typescript
const storage = new SessionStorageTokenStorage('auth_token', 'auth_user')
// ✅ Token se limpia al cerrar pestaña
// ✅ Mejor protección contra XSS
```

### Logs en DEV
```typescript
[SessionStorageTokenStorage] ✅ Token guardado en sessionStorage
[SessionStorageTokenStorage] ✅ Token eliminado de sessionStorage
[SessionStorageTokenStorage] ⚠️ No se pudo guardar en sessionStorage
```

---

## Backend Configuration Required

### Opción 1: Migración Completa a httpOnly (RECOMENDADO)

```javascript
// backend/auth.js

// 1. Generar JWT
const jwt = generateJWT(user, expiresIn)

// 2. Enviar en httpOnly cookie
res.cookie('jwt', jwt, {
  httpOnly: true,      // ✅ JS no puede acceder
  secure: true,        // ✅ Solo HTTPS
  sameSite: 'strict',  // ✅ Protección CSRF
  maxAge: 1000 * 60 * 60 * 24 // 1 día
})

// 3. Enviar user info en response (sin token)
res.json({
  user: {
    id: user.id,
    email: user.email,
    nombre: user.nombre,
    avatar_url: user.avatar_url
  }
})
```

### Opción 2: Transición Gradual

Enviar AMBOS: cookie + response body durante migración

```javascript
// backend/auth.js
const jwt = generateJWT(user)

// Enviar en cookie (para navegadores nuevos)
res.cookie('jwt', jwt, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
})

// Enviar en response (para clientes antiguos)
res.json({
  user: {...},
  auth_token: jwt // ⚠️ Temporal, deprecar después
})
```

### Opción 3: Mantener Status Quo

Continuar con sessionStorage frontend + JWT en response

```javascript
// backend/auth.js
res.json({
  auth_token: jwt,
  user: {...}
})
```

**Nota:** Si backend NO envía httpOnly cookies, frontend automáticamente usa SessionStorageTokenStorage, que es suficientemente seguro.

---

## Migration Checklist

### Frontend ✅ COMPLETADO
- [x] Crear `SessionStorageTokenStorage` class
- [x] Crear `MemoryOnlyTokenStorage` class  
- [x] Actualizar `authServiceFactory` para usar `SessionStorageTokenStorage`
- [x] Actualizar singleton `authService`
- [x] Agregar logs en DEV
- [x] Compatibilidad backwards con `DefaultTokenStorage` (aún disponible)
- [x] Documentation

### Backend ⏳ PENDIENTE
- [ ] Generar JWT en backend
- [ ] Enviar JWT en httpOnly cookie
- [ ] Configurar middleware para CORS + cookies
- [ ] Implementar refresh token en cookie
- [ ] Validar session sin token en body
- [ ] Testing: verificar cookie en response

### Testing ⏳ PENDIENTE  
- [ ] Unit: SessionStorageTokenStorage carga/guarda/limpia
- [ ] Integration: Auth flow con sessionStorage
- [ ] E2E: Login persiste en sesión, se pierde en refresh (si usa sessionStorage)
- [ ] E2E: Login persiste CON refresh (si usa httpOnly cookie)

---

## Testing Examples

### Unit Test: SessionStorageTokenStorage

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SessionStorageTokenStorage } from '@/infrastructure/services/auth/tokenStorage'
import type { User } from '@/domain/user'

describe('SessionStorageTokenStorage', () => {
  let storage: SessionStorageTokenStorage
  const mockUser: User = {
    id: '123',
    email: 'test@example.com',
    nombre: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg'
  }

  beforeEach(() => {
    // Mock sessionStorage
    const sessionStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn()
    }
    Object.defineProperty(window, 'sessionStorage', {
      value: sessionStorageMock
    })
    storage = new SessionStorageTokenStorage('auth_token', 'auth_user')
  })

  it('debe guardar token en sessionStorage', () => {
    storage.save(mockUser, 'test-jwt-token')
    
    expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
      'auth_token',
      'test-jwt-token'
    )
    expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
      'auth_user',
      JSON.stringify(mockUser)
    )
  })

  it('debe cargar token desde sessionStorage', () => {
    ;(window.sessionStorage.getItem as any).mockImplementation((key: string) => {
      if (key === 'auth_token') return 'test-jwt-token'
      if (key === 'auth_user') return JSON.stringify(mockUser)
    })

    const { token, user } = storage.load()
    
    expect(token).toBe('test-jwt-token')
    expect(user).toEqual(mockUser)
  })

  it('debe limpiar sessionStorage al logout', () => {
    storage.clear()
    
    expect(window.sessionStorage.removeItem).toHaveBeenCalledWith('auth_token')
    expect(window.sessionStorage.removeItem).toHaveBeenCalledWith('auth_user')
  })

  it('debe manejar errores de sessionStorage', () => {
    ;(window.sessionStorage.getItem as any).mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })

    const { token, user } = storage.load()
    expect(token).toBeNull()
    expect(user).toBeNull()
  })
})
```

### Integration Test: Auth Flow

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { AuthService } from '@/infrastructure/services/authService'
import { SessionStorageTokenStorage } from '@/infrastructure/services/auth/tokenStorage'

describe('Auth Flow with SessionStorage', () => {
  let authService: AuthService

  beforeEach(() => {
    const storage = new SessionStorageTokenStorage('token', 'user')
    authService = new AuthService(
      {
        apiBaseUrl: 'http://localhost:5000',
        googleClientId: 'test-client-id'
      },
      { storage }
    )
  })

  it('debe guardar user y token después del login', async () => {
    // Mock authService.loginWithGoogle
    const mockUser = { id: '1', email: 'test@test.com', nombre: 'Test' }
    const mockToken = 'eyJ...'
    
    // Simulación de login
    // authService.saveUserAndToken(mockUser, mockToken)
    
    const state = authService.getAuthState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.user).toEqual(mockUser)
    expect(state.token).toBe(mockToken)
  })

  it('debe limpiar datos al logout', async () => {
    // ... setup login first
    
    authService.logout()
    
    const state = authService.getAuthState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
  })
})
```

---

## Performance Impact

### SessionStorage vs localStorage
- **Lectura:** sessionStorage ≈ localStorage (~0.01ms)
- **Escritura:** sessionStorage ≈ localStorage (~0.01ms)
- **Tamaño:** sessionStorage = localStorage (~5-10MB limit)
- **Velocidad:** No hay diferencia significativa

### Memory Storage vs SessionStorage
- **Lectura:** Memoria > sessionStorage (~1000x más rápido)
- **Escritura:** Memoria > sessionStorage (~1000x más rápido)
- **Pero:** sesión se pierde en reload ⚠️

---

## Troubleshooting

### Token desaparece después de cerrar pestaña

**Síntoma:** Usuario cierra pestaña y abre nueva, debe re-loguearse

**Causa:** SessionStorage se limpia al cerrar pestaña (comportamiento esperado)

**Solución:**
1. Es seguro (no es un bug)
2. Si quieres persistencia, espera a implementar httpOnly cookies + backend refresh token
3. Mientras tanto, mantener SessionStorage

### Token no se envía en Authorization header

**Síntoma:** APIs retornan 401 Unauthorized

**Causas:**
1. sessionStorage no está habilitado (revisar permisos)
2. Token no fue guardado correctamente
3. AuthService está usando MemoryOnlyTokenStorage

**Debug:**
```typescript
// En console
sessionStorage.getItem('auth_token')  // Debe retornar token
sessionStorage.getItem('auth_user')   // Debe retornar user object
```

### Sesión persiste entre refresh (no debería)

**Síntoma:** Recargar página y sesión aún está activa

**Causa:** Posiblemente usando localStorage o httpOnly cookies con backend

**Debug:**
```typescript
// Verificar qué storage se está usando
console.log(authService.constructor.name)
```

---

## Security Considerations

### ✅ SessionStorage Protections
1. **Automatic cleanup**: Se limpia al cerrar pestaña
2. **Same-origin only**: JavaScript cross-origin no puede acceder
3. **No persistence**: No persiste entre sesiones (mejor que localStorage)
4. **Short lifespan**: Token vive máximo duración de pestaña abierta

### ✅ MemoryOnlyStorage + httpOnly Cookies (Future)
1. **Never in JS**: Token imposible de exfiltrar vía XSS
2. **Browser-managed**: Navegador maneja cookie automáticamente
3. **SameSite protection**: Cookie solo se envía en mismo-origen
4. **HttpOnly flag**: Cookie no accesible desde JS

### ⚠️ Still Vulnerable To
1. **CSRF**: Mitigado por CSRF tokens (X-CSRF-Token header)
2. **Phishing**: Usuario da credenciales a sitio falso (no tecnológico)
3. **Malware**: Malware local puede leer cualquier storage
4. **Network MITM**: Mitigado por HTTPS + Secure flag en cookies

---

## Migration Path

### Phase 1: ✅ COMPLETADO (Producción ahora)
- SessionStorageTokenStorage activo
- localStorage ya no se usa
- Backward compatible con DefaultTokenStorage si es necesario

### Phase 2: ⏳ Backend Implementación
Backend debe:
1. Generar JWT en backend
2. Enviar en httpOnly cookie
3. Configurar CORS para credenciales
4. Implementar refresh token en cookie

Entonces frontend:
```typescript
// Habilitar MemoryOnlyTokenStorage cuando backend esté listo
const storage = import.meta.env.VITE_USE_HTTPONLY_COOKIES 
  ? new MemoryOnlyTokenStorage() 
  : new SessionStorageTokenStorage('token', 'user')
```

### Phase 3: ✅ Máxima Seguridad
Todas las sesiones usan httpOnly cookies + memory-only storage:
- Imposible XSS steal tokens
- Navegador maneja cookies automáticamente
- Backend valida sin revisar body (solo cookie)

---

## References

- [OWASP: Storing Tokens](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html#token-storage)
- [sessionStorage vs localStorage](https://www.codementor.io/pankajmittal/localstorage-vs-sessionstorage-vs-cookies-hl3zl7ak0)
- [httpOnly Cookies](https://owasp.org/www-community/attacks/xss/#stored-xss-attacks)
- [CORS with Credentials](https://developer.mozilla.org/en-US/docs/Web/API/fetch_api#sending_credentials)

---

**Última actualización:** 11/01/2026  
**Estado:** Frontend ✅ Completo | Backend ⏳ Pendiente  
**Próximo:** Implementar httpOnly cookies en backend
