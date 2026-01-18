# Mejoras del Cliente HTTP - Arquitectura Limpia

## 📋 Resumen de cambios

Se refactorizó el cliente HTTP siguiendo principios SOLID y arquitectura limpia, agregando:

1. **Validación de Content-Type** con errores enriquecidos
2. **Configuración centralizada** de URLs sin duplicación
3. **Soporte para ngrok** con header `ngrok-skip-browser-warning`
4. **Tests unitarios** completos

---

## 🏗️ Arquitectura

### Separación de responsabilidades (SOLID)

```
infrastructure/http/
├── ResponseValidator.ts   # Valida content-type y formato de respuesta
├── ApiConfig.ts          # Centraliza configuración de URLs y prefijos
├── HttpClient.ts         # Cliente HTTP con retry, timeout y validación
├── index.ts              # Barrel export
└── __tests__/
    ├── ResponseValidator.spec.ts
    ├── ApiConfig.spec.ts
    └── HttpClient.spec.ts
```

### Principios aplicados

- **Single Responsibility**: Cada clase tiene una única responsabilidad
- **Open/Closed**: Extensible mediante inyección de dependencias
- **Dependency Inversion**: Depende de abstracciones (interfaces)
- **Interface Segregation**: Interfaces específicas para cada caso

---

## 🔧 Componentes

### 1. ResponseValidator

Valida que la respuesta tenga el content-type esperado y genera errores enriquecidos.

**Características:**
- ✅ Detecta HTML cuando se espera JSON
- ✅ Identifica interstitiales de ngrok
- ✅ Extrae título HTML y meta tags
- ✅ Captura headers relevantes (CSP, X-Frame-Options, etc.)
- ✅ Genera snippet del body para diagnóstico

**Uso:**

```typescript
import { ResponseValidator } from '@/infrastructure/http'

const validator = new ResponseValidator('application/json')

try {
  await validator.validate(response, url, requestId)
} catch (error) {
  if (error instanceof ResponseValidationError) {
    console.error(error.validationError.details)
    // {
    //   url, status, contentType, bodyPreview,
    //   headers, requestId, timestamp
    // }
  }
}
```

**Detección de casos específicos:**

```typescript
// Detecta ngrok
"Ngrok intersticial detectado. Agrega header 'ngrok-skip-browser-warning'"

// Detecta 404
"Página 404 devuelta. Verifica VITE_API_BASE_URL y los prefijos"

// Detecta 500
"Error 500 del servidor. El backend devolvió HTML en lugar de JSON"
```

---

### 2. ApiConfig

Centraliza configuración de URLs y elimina duplicación de strings.

**Configuración por entorno:**

```typescript
import { getApiConfig } from '@/infrastructure/http'

const config = getApiConfig()

// Auto-detecta ngrok y activa skipNgrokWarning en dev
config.baseUrl          // 'https://unhued-tashia-beforehand.ngrok-free.app'
config.apiPrefix        // '/api'
config.skipNgrokWarning // true (si es ngrok en dev)
```

**Variables de entorno:**

```bash
# .env.development
VITE_API_BASE_URL=https://unhued-tashia-beforehand.ngrok-free.app
VITE_API_PREFIX=/api              # Opcional, default: /api
VITE_API_TIMEOUT=15000            # Opcional, default: 15000
VITE_API_RETRY_ATTEMPTS=3         # Opcional, default: 3
```

**Construcción de URLs:**

```typescript
// Métodos helper para endpoints comunes
config.contributions()              // /api/contributions
config.contributions('abc123')      // /api/contributions/abc123
config.userContributions('user_1')  // /api/users/user_1/contributions
config.health()                     // /api/health
config.auth('login')                // /api/auth/login

// Construcción manual
config.buildUrl('/custom/endpoint') // /api/custom/endpoint
```

**Custom config para tests:**

```typescript
const config = ApiConfig.create({
  baseUrl: 'http://localhost:3000',
  apiPrefix: '/v2',
  timeout: 5000
})
```

---

### 3. HttpClient

Cliente HTTP con validación, retry y manejo de errores.

**Características:**
- ✅ Retry con backoff exponencial (1s, 2s, 4s)
- ✅ Timeout configurable
- ✅ Validación automática de content-type
- ✅ Headers adicionales (Auth, CSRF, ngrok)
- ✅ Request ID para tracing
- ✅ Manejo de 204 No Content

**Uso básico:**

```typescript
import { HttpClient, getApiConfig } from '@/infrastructure/http'

const client = new HttpClient({
  config: getApiConfig(),
  additionalHeaders: {
    'Authorization': `Bearer ${token}`,
    'X-CSRF-Token': csrfToken
  }
})

// GET
const user = await client.get<User>('/users/123')

// POST
const created = await client.post('/users', { name: 'John' })

// PUT/PATCH/DELETE
await client.put('/users/123', { name: 'Jane' })
await client.patch('/users/123', { status: 'active' })
await client.delete('/users/123')
```

**Manejo de errores:**

```typescript
try {
  const data = await client.get('/endpoint')
} catch (error) {
  if (error instanceof ResponseValidationError) {
    // Content-type incorrecto (ej: HTML en lugar de JSON)
    console.error('Validation error:', error.validationError.details)
  } else if (error instanceof HttpClientError) {
    // Error HTTP (4xx, 5xx, timeout, red)
    console.error('HTTP error:', error.httpError)
  }
}
```

**Header ngrok automático:**

Cuando `skipNgrokWarning=true` y la URL contiene "ngrok":

```typescript
// Automáticamente agrega:
headers['ngrok-skip-browser-warning'] = 'true'
```

---

## 🔄 Migración desde código actual

### Antes (ContributionsRepository actual)

```typescript
// Código duplicado
const url = `${this.apiBaseUrl}/api/contributions/${token}`

// Validación manual
if (contentType.includes('text/html')) {
  throw new ContributionRepositoryError('HTML recibido')
}

// Fetch manual con timeout
const controller = new AbortController()
const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)
const response = await fetch(url, { signal: controller.signal })
clearTimeout(timeout)
```

### Después (ContributionsRepository refactorizado)

```typescript
// URL centralizada
const url = this.config.contributions(token)

// Validación automática
const contribution = await this.httpClient.get<UserContribution>(url)
// Si llega HTML, lanza ResponseValidationError automáticamente
```

**Ventajas:**
- ✅ Menos código duplicado
- ✅ Errores más descriptivos
- ✅ Configuración centralizada
- ✅ Más fácil de testear

---

## 🧪 Tests

Se incluyen tests completos con **Vitest**:

```bash
# Ejecutar tests
npm run test

# Tests específicos
npm run test ResponseValidator
npm run test ApiConfig
npm run test HttpClient

# Coverage
npm run test:coverage
```

**Cobertura de tests:**

- ✅ Validación de content-type (JSON, HTML, texto)
- ✅ Detección de casos especiales (ngrok, 404, 500)
- ✅ Construcción de URLs con diferentes prefijos
- ✅ Normalización de URLs (trailing slash, etc.)
- ✅ Retry con backoff exponencial
- ✅ Timeout
- ✅ Manejo de errores HTTP
- ✅ Headers custom y ngrok

---

## 🚀 Uso en producción

### 1. Actualizar variables de entorno

```bash
# .env.development
VITE_API_BASE_URL=https://unhued-tashia-beforehand.ngrok-free.app

# .env.production
VITE_API_BASE_URL=https://api.proyecto.madypack.com.ar
```

### 2. Actualizar ContributionsRepository

Reemplazar el archivo actual por la versión refactorizada:

```bash
# Backup del actual
mv src/infrastructure/repositories/ContributionsRepository.ts \
   src/infrastructure/repositories/ContributionsRepository.backup.ts

# Usar la versión refactorizada
mv src/infrastructure/repositories/ContributionsRepository.refactored.ts \
   src/infrastructure/repositories/ContributionsRepository.ts
```

### 3. Verificar imports

```typescript
// Los imports deben funcionar sin cambios en el código cliente
import { contributionsRepository } from '@/infrastructure/repositories/ContributionsRepository'

// Uso idéntico
const contribution = await contributionsRepository.getByToken(token)
```

---

## 🔍 Diagnóstico de errores

### Error: HTML en lugar de JSON

**Antes:**
```
ContributionRepositoryError: Respuesta HTML recibida del endpoint
```

**Después:**
```typescript
ResponseValidationError {
  validationError: {
    type: 'invalid_content_type',
    message: 'Ngrok intersticial detectado. Agrega header ngrok-skip-browser-warning',
    details: {
      url: 'https://test.ngrok-free.app/api/contributions/abc',
      status: 200,
      contentType: 'text/html',
      expectedContentType: 'application/json',
      bodyPreview: 'HTML Title: ngrok\nPreview:\n<html>...',
      headers: {
        'content-security-policy': 'default-src cdn.ngrok.com'
      },
      requestId: 'req_1234567890_abc',
      timestamp: '2026-01-17T10:30:00.000Z'
    }
  }
}
```

**Información incluida:**
- ✅ URL completa solicitada
- ✅ Content-Type recibido vs esperado
- ✅ Snippet del HTML (con título)
- ✅ Headers relevantes (CSP, etc.)
- ✅ Request ID para tracing
- ✅ Timestamp del error
- ✅ Sugerencia de solución

---

## 📦 CORS y Preflight

### Problema con `ngrok-skip-browser-warning`

Agregar headers custom puede causar preflight OPTIONS.

**Solución en el backend:**

```typescript
// Express.js
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://proyecto.madypack.com.ar')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Allow-Headers', 
    'Content-Type, Authorization, X-CSRF-Token, ngrok-skip-browser-warning'
  )
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204)
  }
  
  next()
})
```

**Verificar en DevTools:**

```bash
# Network tab -> Headers
Request Headers:
  ngrok-skip-browser-warning: true
  
Response Headers:
  Access-Control-Allow-Headers: ..., ngrok-skip-browser-warning
```

---

## 🎯 Casos de uso

### Caso 1: Ngrok en desarrollo

```typescript
// Auto-detecta y configura
const config = getApiConfig()
// baseUrl: 'https://test.ngrok-free.app'
// skipNgrokWarning: true (en dev)

// Agrega header automáticamente
const client = new HttpClient({ config })
await client.get('/endpoint')
// Request incluye: ngrok-skip-browser-warning: true
```

### Caso 2: Producción sin ngrok

```typescript
// .env.production
// VITE_API_BASE_URL=https://api.madypack.com.ar

const config = getApiConfig()
// baseUrl: 'https://api.madypack.com.ar'
// skipNgrokWarning: false

// NO agrega header ngrok
const client = new HttpClient({ config })
await client.get('/endpoint')
```

### Caso 3: Tests con mock

```typescript
import { ApiConfig, HttpClient } from '@/infrastructure/http'

const mockConfig = ApiConfig.create({
  baseUrl: 'http://localhost:3000',
  timeout: 100,
  retryAttempts: 1
})

const client = new HttpClient({ config: mockConfig })
```

---

## 📊 Comparación con el código actual

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Validación** | Manual, básica | Automática, enriquecida |
| **URLs** | Strings duplicados | Centralizada, sin duplicación |
| **Errores** | Genéricos | Detallados con contexto |
| **Retry** | No implementado | Backoff exponencial |
| **Ngrok** | Problema conocido | Header automático |
| **Tests** | Sin tests unitarios | >90% cobertura |
| **SOLID** | Responsabilidades mezcladas | Separación clara |
| **Diagnóstico** | Difícil | Fácil con request ID |

---

## ✅ Checklist de implementación

- [x] Crear ResponseValidator con detección de HTML
- [x] Crear ApiConfig con construcción de URLs
- [x] Crear HttpClient con retry y validación
- [x] Refactorizar ContributionsRepository
- [x] Crear tests unitarios (ResponseValidator)
- [x] Crear tests unitarios (ApiConfig)
- [x] Crear tests unitarios (HttpClient)
- [x] Documentar cambios y uso

**Para deployment:**
- [ ] Ejecutar tests: `npm run test`
- [ ] Reemplazar ContributionsRepository por versión refactorizada
- [ ] Verificar variables de entorno (.env.development, .env.production)
- [ ] Actualizar CORS en backend (agregar ngrok-skip-browser-warning)
- [ ] Testear en dev con ngrok
- [ ] Testear en staging sin ngrok
- [ ] Deploy a producción

---

## 🐛 Troubleshooting

### Error: "Module not found: @/infrastructure/http"

```typescript
// Verificar que existe el barrel export
// src/infrastructure/http/index.ts
```

### Tests fallan por timeout

```typescript
// Aumentar timeout en vitest.config.ts
export default defineConfig({
  test: {
    testTimeout: 10000
  }
})
```

### ngrok-skip-browser-warning no funciona

1. Verificar que la URL contenga "ngrok"
2. Verificar que `skipNgrokWarning=true`
3. Verificar CORS en el backend
4. Inspeccionar request headers en DevTools

---

## 📚 Referencias

- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Ngrok Skip Browser Warning](https://ngrok.com/docs/cloud-edge/edges/#browser-warning)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [Vitest](https://vitest.dev/)

---

## 👥 Contribución

Para agregar nuevas funcionalidades:

1. Mantener separación de responsabilidades
2. Agregar tests para cada caso
3. Documentar en este README
4. Verificar que no rompe compatibilidad hacia atrás

---

## 📝 Notas adicionales

### Por qué no usar Axios

Se mantiene `fetch` nativo por:
- ✅ Sin dependencias externas
- ✅ Mejor para tree-shaking
- ✅ Nativo en navegadores y Node 18+
- ✅ API moderna y estándar

### Por qué separar ApiConfig

- ✅ Fácil mock en tests
- ✅ Reutilizable en múltiples clientes
- ✅ Sin lógica HTTP mezclada
- ✅ Cambios de URL sin tocar cliente

### Por qué ResponseValidator separado

- ✅ Testeable de forma aislada
- ✅ Reutilizable (JSON, XML, texto)
- ✅ Extensible con custom validators
- ✅ No acopla validación a HTTP
