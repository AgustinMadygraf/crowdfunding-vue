# 🔍 DIAGNÓSTICO: Falla en getByToken() (SubscribePaymentView)

## ✅ HALLAZGO: El problema NO es la URL base

### Evidencia:
1. **POST `/api/contributions` funciona perfectamente** ✅
   - Mismo `ContributionsRepository`
   - Mismo `apiBaseUrl` de config
   - Token creado exitosamente: `contrib_e6248962-5db2...`

2. **GET `/api/contributions/{token}` recibe HTML** ❌
   - Error: `ContributionRepositoryError: Respuesta HTML recibida del endpoint`
   - Logs muestran HTML válido siendo recibido

### Análisis de código:

#### 1. ContributionsRepository.ts - Línea 234
```typescript
async getByToken(token: string): Promise<UserContribution> {
  // ✅ Mismo apiBaseUrl que en create()
  const url = `${this.apiBaseUrl}/api/contributions/${token}`
  // ✅ Con authHeaders
  const response = await this.fetchWithGuard(url, { headers })
  // ✅ Con fetchWithGuard (validación de HTML)
}
```

**Conclusión**: La URL y configuración son **idénticas** a POST.

---

## 🎯 PROBLEMA REAL IDENTIFICADO

### 🔴 Síntoma en consola:
```
[useSubscription] ❌ Error al cargar contribución: 
ContributionRepositoryError: Respuesta HTML recibida del endpoint. 
Revisa VITE_API_BASE_URL o el proxy.
```

### 📍 Fuente del HTML:
El error está siendo **detectado correctamente por `fetchWithGuard()`** pero el origen real es:

**Opción A: ngrok intersticial** 
- Headers: `X-Ngrok-Skip-Browser-Warning` faltante
- Content-Type: `text/html` ✅ (detectado)

**Opción B: Redirect HTTP → HTTPS sin manejar**
- El fetch sigue redirects automáticamente
- Pero después llega a una página de error/login

**Opción C: CORS preflight fallido silenciosamente**
- Browser hace OPTIONS automático
- Si falla, podría servir una página de error

---

## 🔧 MEJORAS NECESARIAS

### 1. **Agregar logging detallado de diagnostico**
   - ✅ YA EXISTE: `fetchWithGuard()` loguea HTML title, preview, URL
   - ⚠️ FALTA: Loguear headers de RESPUESTA (especialmente redirection info)
   - ⚠️ FALTA: Loguear headers de REQUEST (Accept, Authorization)

### 2. **Mejorar detección de ngrok**
   - Headers: `X-Ngrok-Skip-Browser-Warning: 69420`
   - O: Detectar en response.url si tiene `.ngrok.io`

### 3. **Validar que Authorization header se mantiene**
   - `getByToken()` refesca token pero ¿se mantiene después de redirect?
   - Agregar logging: `Authorization: Bearer ${truncated_token}`

---

## 📋 CHECKLIST: Qué verificar en BACKEND

```
❓ POST /contributions ✅ (funciona)
❓ GET /contributions/{token} con header Authorization ❓
  - ¿Se acepta token en header?
  - ¿O espera en query string?
  
❓ Response Content-Type: application/json ❓
  - ¿O está siendo servido con text/html?

❓ CORS en GET /contributions/{token} ❓
  - ¿Está configurado Access-Control-Allow-Origin?
  - ¿Está permitiendo OPTIONS?

❓ ngrok - ¿Está agregando interstitial?
  - Agregar header en cliente: X-Ngrok-Skip-Browser-Warning: 69420
```

---

## 🛠️ SOLUCIONES A IMPLEMENTAR

### A. Mejorar ResponseValidator (detectar más casos)
```typescript
// En HttpClient.ts - buildHeaders()
private buildHeaders(...) {
  const headers = {
    'Accept': 'application/json',  // ✅ Ya existe
    'Content-Type': 'application/json',
    'X-Ngrok-Skip-Browser-Warning': '69420', // 🆕 Para ngrok
    // ...
  }
}
```

### B. Agregar logging de request/response headers
```typescript
// En ContributionsRepository.ts - getByToken()
private async fetchWithGuard(input, init) {
  // LOG request headers
  console.log('[ContributionsRepository] 📤 Request headers:')
  console.log('  Accept:', requestHeaders.get('Accept'))
  console.log('  Authorization:', 'Bearer ' + authService.getToken().slice(0, 20) + '...')
  
  // LOG response headers
  console.log('[ContributionsRepository] 📥 Response headers:')
  console.log('  Content-Type:', response.headers.get('content-type'))
  console.log('  Location:', response.headers.get('location'))
  console.log('  X-Ngrok-*:', response.headers.getSetCookie?.())
}
```

### C. Detectar y manejar redirecciones sospechosas
```typescript
if (response.url !== urlStr && response.redirected) {
  console.warn('[ContributionsRepository] ⚠️ REDIRECT DETECTED')
  console.warn('  Original: ' + urlStr)
  console.warn('  Final URL: ' + response.url)
  console.warn('  Status: ' + response.status)
}
```

---

## 📊 Tabla Comparativa: POST vs GET

| Aspecto | POST /contributions | GET /contributions/{token} |
|--------|-------------------|---------------------------|
| apiBaseUrl | ✅ Mismo | ✅ Mismo |
| Auth headers | ✅ Mismo | ✅ Mismo |
| Method | POST | GET |
| Body | JSON | Empty |
| Accept header | ✅ application/json | ✅ application/json |
| Funciona | ✅ Sí | ❌ No (HTML) |
| Hipótesis | - | Query string? CORS? Redirect? |

---

## 🚀 PRÓXIMOS PASOS

1. **Implementar logs mejorados** (ver sección SOLUCIONES)
2. **Ejecutar con logs y capturar OUTPUT**
3. **Verificar respuesta con DevTools > Network**
4. **Confirmar backend está respondiendo JSON en GET**
5. **Si es ngrok: agregar header X-Ngrok-Skip-Browser-Warning**
6. **Si es redirect: investigar cadena de redirects**
