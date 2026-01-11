# 🔐 CSRF Protection - Documentación Frontend

## Overview

Implementación de protección contra ataques CSRF (Cross-Site Request Forgery) en el frontend. Este documento describe cómo funciona y cómo configurar el backend para completar la implementación.

## Arquitectura

### Componentes Frontend

#### 1. **CsrfService** (`src/infrastructure/services/csrfService.ts`)
Servicio centralizado para gestionar tokens CSRF.

**Responsabilidades:**
- Leer token CSRF desde múltiples fuentes (cookie, meta tag, localStorage)
- Almacenar token en memoria y localStorage
- Proporcionar token cuando se necesita en requests

**Métodos principales:**
```typescript
getToken(): string | null                    // Obtiene token actual
readFromCookie(name?): string | null        // Lee de cookie
readFromHeader(name?): string | null        // Lee de meta tag
setToken(token: string): void               // Almacena token
getTokenHeader(token, name?): Record        // Crea header CSRF
```

#### 2. **useCsrfToken** (`src/application/composables/useCsrfToken.ts`)
Composable para inicializar y gestionar CSRF en componentes Vue.

**Uso:**
```typescript
const { initializeCsrfToken, getToken } = useCsrfToken()
// Se ejecuta automáticamente al montar el componente
```

#### 3. **ApiClient** (`src/infrastructure/api.ts`)
Actualizado para incluir token CSRF automáticamente en requests que modifican estado.

**Cambios:**
- Método `getMutatingHeaders()` que incluye el token CSRF
- POST, PUT, PATCH, DELETE ahora envían token automáticamente
- `credentials: 'include'` para permitir cookies cross-origin

### Flujo de Funcionamiento

```
┌─────────────────────────────────────────────────────────┐
│ 1. Backend genera token CSRF y lo envía al frontend     │
│    Opciones:                                             │
│    - Meta tag: <meta name="X-CSRF-Token" content="..."> │
│    - Cookie: Set-Cookie: XSRF-TOKEN=...                 │
│    - Header: X-CSRF-Token: ...                          │
└─────────────────────────────────────────────────────────┘
                         ⬇
┌─────────────────────────────────────────────────────────┐
│ 2. App.vue inicializa CSRF al montar                    │
│    useCsrfToken() → busca token de meta/cookie          │
│    Almacena en memoria y localStorage                   │
└─────────────────────────────────────────────────────────┘
                         ⬇
┌─────────────────────────────────────────────────────────┐
│ 3. ApiClient adjunta token a requests de mutación       │
│    POST /api/contributions                              │
│    Headers:                                              │
│    - X-CSRF-Token: {token}                              │
│    - credentials: include (cookies)                     │
└─────────────────────────────────────────────────────────┘
                         ⬇
┌─────────────────────────────────────────────────────────┐
│ 4. Backend valida token CSRF                            │
│    Si válido → procesa request                          │
│    Si inválido → rechaza con 403 Forbidden              │
└─────────────────────────────────────────────────────────┘
```

## Configuración Backend Requerida

### Opción 1: Enviar token en Meta Tag (Recomendado)

Backend debe inyectar token CSRF en el HTML:

```html
<!-- index.html servido por backend -->
<head>
  <meta name="X-CSRF-Token" content="...token-value...">
</head>
```

**Ventaja:** Token disponible inmediatamente sin requests adicionales.

### Opción 2: Enviar token en Cookie

Backend debe configurar cookie CSRF:

```
Set-Cookie: XSRF-TOKEN={token}; Path=/; SameSite=Strict; Secure
```

Frontend leerá automáticamente de la cookie `XSRF-TOKEN`.

**Ventaja:** Compatible con navegadores antiguos.

### Opción 3: Enviar token en Header GET

Backend puede responder a GET inicial con header:

```
X-CSRF-Token: ...token-value...
```

Frontend leerá del response header.

**Nota:** Menos recomendado, requiere GET inicial.

## Validación Backend

### Pseudocódigo para validar en endpoints POST/PUT/PATCH/DELETE

```javascript
// middleware/csrfProtection.js
function validateCsrfToken(req, res, next) {
  // 1. Obtener token de session (generado al login o inicial)
  const sessionToken = req.session.csrfToken
  
  // 2. Obtener token de request
  const requestToken = req.headers['x-csrf-token'] || 
                       req.body._csrf || 
                       req.query._csrf
  
  // 3. Comparar tokens
  if (!sessionToken || !requestToken || sessionToken !== requestToken) {
    return res.status(403).json({
      status: 403,
      message: 'Token CSRF inválido o faltante'
    })
  }
  
  // Token válido, continuar
  next()
}

// Usar en rutas de mutación
app.post('/api/contributions', validateCsrfToken, createContribution)
app.put('/api/contributions/:id', validateCsrfToken, updateContribution)
app.patch('/api/contributions/:id', validateCsrfToken, patchContribution)
app.delete('/api/contributions/:id', validateCsrfToken, deleteContribution)
```

### Generar y enviar token inicial

```javascript
// auth/csrf.js
function generateCsrfToken() {
  const crypto = require('crypto')
  return crypto.randomBytes(32).toString('hex')
}

// middleware/csrfInit.js
function initializeCsrfToken(req, res, next) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateCsrfToken()
  }
  
  // Enviar en meta tag (recomendado)
  res.locals.csrfToken = req.session.csrfToken
  
  // O enviar en cookie (alternativa)
  res.cookie('XSRF-TOKEN', req.session.csrfToken, {
    httpOnly: false,  // Permitir lectura desde JS
    secure: true,      // Solo HTTPS
    sameSite: 'strict'
  })
  
  next()
}
```

## Ejemplos de Uso

### Crear una contribución (POST)

```typescript
// Frontend - automático con ApiClient
const contributionsRepository = new ContributionsRepository(apiClient)
await contributionsRepository.create({
  user_id: 'user123',
  monto: 500,
  nivel_id: 'nivel1'
  // Token CSRF se adjunta automáticamente por ApiClient
})
```

### Request HTTP resultante

```
POST /api/contributions HTTP/1.1
Host: api.example.com
Content-Type: application/json
X-CSRF-Token: abc123def456...
Cookie: XSRF-TOKEN=abc123def456...; session=...

{
  "user_id": "user123",
  "monto": 500,
  "nivel_id": "nivel1"
}
```

### Backend recibe y valida

```javascript
// Backend
app.post('/api/contributions', validateCsrfToken, (req, res) => {
  // En este punto, token ya fue validado
  // Continuar con lógica de negocio
  const contribution = createContribution(req.body)
  res.json({ data: contribution })
})
```

## Configuración SameSite Cookie

Para máxima seguridad, configurar cookies con `SameSite=Strict`:

```
Set-Cookie: XSRF-TOKEN=...; Path=/; SameSite=Strict; Secure; HttpOnly=false
Set-Cookie: session=...; Path=/; SameSite=Strict; Secure; HttpOnly=true
```

**Explicación:**
- `SameSite=Strict`: Cookie no se envía en requests cross-site (máxima protección)
- `Secure`: Solo se envía en HTTPS
- `HttpOnly=false` para XSRF-TOKEN (frontend necesita leerlo)
- `HttpOnly=true` para session (solo backend lee)

## Testing

### Test unitario para CsrfService

```typescript
import { DefaultCsrfService } from '@/infrastructure/services/csrfService'

describe('CsrfService', () => {
  it('debe leer token de cookie', () => {
    // Mock document.cookie
    Object.defineProperty(document, 'cookie', {
      value: 'XSRF-TOKEN=test123; path=/',
      writable: true
    })
    
    const service = new DefaultCsrfService()
    const token = service.readFromCookie('XSRF-TOKEN')
    expect(token).toBe('test123')
  })
  
  it('debe incluir token CSRF en headers', () => {
    const service = new DefaultCsrfService()
    service.setToken('mytoken')
    
    const headers = service.getTokenHeader('mytoken')
    expect(headers['X-CSRF-Token']).toBe('mytoken')
  })
})
```

### Test de integración

```typescript
import { apiClient } from '@/infrastructure/api'
import { csrfService } from '@/infrastructure/services/csrfService'

describe('CSRF Integration', () => {
  it('debe adjuntar token CSRF a POST request', async () => {
    // Mock fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1 })
    })
    
    csrfService.setToken('test-token')
    
    await apiClient.post('/api/test', { data: 'test' })
    
    const callArgs = (global.fetch as any).mock.calls[0]
    const headers = callArgs[1].headers
    expect(headers['X-CSRF-Token']).toBe('test-token')
  })
})
```

## Troubleshooting

### Token CSRF no se adjunta

**Síntoma:** POST requests no tienen header `X-CSRF-Token`

**Solución:**
1. Verificar que `csrfService.getToken()` retorna un valor (no null)
2. Revisar logs en DEV: `[ApiClient] ⚠️ Token CSRF no disponible`
3. Asegurar que backend está enviando token en meta tag o cookie
4. Verificar nombre de meta tag: debe ser exactamente `X-CSRF-Token`

### Backend rechaza request con 403

**Síntoma:** POST request retorna 403 Forbidden

**Causas:**
1. Token en frontend no coincide con token en backend
2. Backend no incluyó token en response HTML
3. Cookie no se envía (verificar CORS y `credentials: 'include'`)
4. Token expiró (implementar refresh de token)

**Debug:**
```typescript
// Verificar token disponible
console.log('Token CSRF:', csrfService.getToken())

// Verificar headers en request
// Abrir DevTools → Network → ver headers de POST request
```

### Token no persiste entre pestañas

**Síntoma:** Abrir nueva pestaña y token se pierde

**Solución:**
- Token se almacena en `localStorage`, debe funcionar entre pestañas
- Si no funciona, verificar que `localStorage` está habilitado
- Revisar permisos de Privacy/3rd-party cookies en navegador

## Security Considerations

### ✅ Protecciones implementadas

1. **Token en memoria + localStorage**
   - Token no viaja en URL
   - No visible en logs de servidor
   
2. **Header X-CSRF-Token**
   - No puede ser leído por scripts cross-origin (CORS)
   - Navegador no envía automáticamente en requests cross-origin
   
3. **credentials: 'include'**
   - Cookies se incluyen en requests
   - Backend puede verificar cookie + header
   
4. **SameSite cookie**
   - Previene CSRF automáticamente en navegadores modernos
   - Doble protección (cookie + header)

### ⚠️ Limitaciones

- Token se almacena en localStorage (vulnerable a XSS)
  - **Mitigación:** CSP headers previenen XSS
- Token visible en DevTools
  - **Mitigación:** No sensible en sí mismo, validado con sesión server
- No protege contra CSRF de navegadores muy antiguos
  - **Mitigación:** SameSite cookie como fallback

## Performance

### Impacto

- **Overhead:** Mínimo (~1ms por request)
- **Size:** Header CSRF ~64 bytes (token hex de 32 bytes)
- **Latency:** No hay latencia adicional

### Optimizaciones

- Token se cachea en memoria, no se re-lee de localStorage cada request
- localStorage es más rápido que API call (local only)
- No hay retry automático para errores 403 (correcto, es un error de cliente)

## Referencias

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [RFC 6265 (Cookies)](https://tools.ietf.org/html/rfc6265)
- [SameSite Cookie Explained](https://web.dev/samesite-cookies-explained/)

---

**Última actualización:** 11/01/2026  
**Próximos pasos:** Sincronizar con backend para implementar validación
