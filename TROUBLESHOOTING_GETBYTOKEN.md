# 🛠️ GUÍA DE TROUBLESHOOTING: getByToken() falla con HTML

## 📋 RESUMEN EJECUTIVO

**Problema**: GET `/api/contributions/{token}` recibe HTML en lugar de JSON en SubscribePaymentView

**POST `/api/contributions`**: ✅ Funciona perfectamente

**Conclusión**: No es un problema de configuración de apiBaseUrl (es idéntica), sino:
1. **Probable**: ngrok intersticial HTML (falta header para saltarlo)
2. **Posible**: Redirect HTTP→HTTPS sin manejar
3. **Posible**: CORS preflight fallido
4. **Posible**: Backend no responde con JSON en GET

---

## 🔧 IMPLEMENTADO: MEJORAS AUTOMÁTICAS

### ✅ 1. Logging Mejorado en fetchWithGuard()
```typescript
// Ahora loguea automáticamente:
// - Request headers (Accept, Authorization, ngrok-skip-browser-warning)
// - Response headers (Content-Type, Location, redirects)
// - Detección de redirects HTTP→HTTPS
// - Preview del HTML recibido (200 chars)
// - Detalles completos en console.error
```

**Habilitar**: Agregar a `.env.development`
```
VITE_DEBUG_HTTP=true
```
✅ **YA HECHO** en `.env.development`

### ✅ 2. Header ngrok automático
```typescript
// En fetchWithGuard() ahora automáticamente agrega:
requestHeaders.set('ngrok-skip-browser-warning', 'true')
```

### ✅ 3. Logging en getByToken()
```typescript
// Loguea:
// - Token (primeros 20 chars)
// - URL construida
// - Headers enviados
// - Éxito/error con detalles
```

### ✅ 4. Herramienta Diagnóstica Interactiva
```typescript
// En consola del navegador:
window.__apiDiagnostic.test()
  → Ejecuta suite completa de tests

window.__apiDiagnostic.testEndpoint('/api/health')
  → Prueba endpoint específico

window.__apiDiagnostic.testEndpoint('/api/contributions/YOUR_TOKEN')
  → Prueba getByToken con token real
```

---

## 📌 CHECKLIST DE DIAGNÓSTICO

### Paso 1: Verificar Configuración
```bash
# En la consola:
window.__apiDiagnostic.test()

# Buscar en la salida:
✅ apiBaseUrl debe ser: http://localhost:5000 (o tu ngrok URL)
✅ environment: development
✅ debugHttp: true
✅ isTokenValid: true
```

### Paso 2: Probar Health Endpoint
```bash
# Debe retornar JSON, no HTML
window.__apiDiagnostic.testEndpoint('/api/health')

# Verificar:
✅ Status: 200
✅ Content-Type: application/json
✅ Response es JSON válido
```

### Paso 3: Crear Contribución
1. Ir a `/subscribe`
2. Llenar formulario
3. Click "Enviar"
4. **Ver en console**:
```
[ContributionsRepository] ✅ Contribución creada: d1d3deef-36fe-4545-bc19-4f07c9cbab70
[Subscribe] 🎫 Token: contrib_e6248962-5db2-...
```

### Paso 4: Probar getByToken
Después de crear contribución:
```bash
# Reemplazar TOKEN con el token real (p.ej: contrib_e6248962-5db2...)
window.__apiDiagnostic.testEndpoint('/api/contributions/TOKEN')

# Verificar:
✅ Status: 200
✅ Content-Type: application/json (NO text/html)
✅ Response contiene detalles de la contribución
```

Si falla con HTML:
```
❌ Content-Type: text/html
❌ Status: 200 (ngrok) o 307/308 (redirect)
❌ HTML Title: ngrok o error del servidor
```

---

## 🆘 SI SIGUE FALLANDO: Diagnóstico Avanzado

### A. Detectar ngrok intersticial
Buscar en console:
```
[ContributionsRepository] 🚨 CRITICAL - HTML response when JSON expected
[ContributionsRepository] HTML Title: ngrok browser warning
```

**Solución**:
- ✅ Ya implementado: header `ngrok-skip-browser-warning: true`
- Si aún falla: verificar que VITE_API_BASE_URL incluye el ngrok correcto
- En ngrok dashboard: actualizar autenticación si es necesario

### B. Detectar Redirect Chain
Buscar en console:
```
[ContributionsRepository] ⚠️ REDIRECT CHAIN DETECTED
[ContributionsRepository] Original: http://...
[ContributionsRepository] Final: https://... (diferente!)
```

**Probable causa**: HTTP→HTTPS redirect no manejado

**Solución**:
- Usar HTTPS en VITE_API_BASE_URL: `https://...ngrok-free.app`
- Verificar que backend está en HTTPS

### C. Verificar CORS
En DevTools > Network > Pestaña GET /contributions/TOKEN:

```
Status: 200 OK (pero HTML)
   OR
Status: 307/308 Temporary Redirect
```

Si hay error CORS:
```
Status: 0 (blocked)
Console: Access to XMLHttpRequest blocked by CORS policy
```

**Solución**: Verificar backend:
```typescript
// Backend debe tener:
res.header('Access-Control-Allow-Origin', 'http://localhost:5173')
res.header('Access-Control-Allow-Credentials', 'true')
res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
```

### D. Verificar Authorization Header
En console, buscar:
```
[ContributionsRepository] 📤 REQUEST [req_...]
  Authorization: Bearer ...

[ContributionsRepository] ✅ getByToken() success
  (si llega acá, Auth es correcto)
```

Si no hay Authorization:
```
[ContributionsRepository] ❌ Conexión o parsing error
[ContributionsRepository] Authorization header sent? false
```

**Solución**: Verificar `authService.getToken()` está poblado

---

## 📊 MATRIZ DE SÍNTOMAS → CAUSAS

| Síntoma | Content-Type | Status | Probable Causa |
|---------|--------------|--------|---|
| HTML con `<title>ngrok` | text/html | 200 | Ngrok intersticial |
| HTML con `<title>error` | text/html | 200 | Página de error backend |
| HTML index.html | text/html | 200 | Frontend sirviendo como proxy |
| HTML vacío | text/html | 307/308 | Redirect HTTP→HTTPS |
| JSON 401 | application/json | 401 | Token expirado |
| JSON 404 | application/json | 404 | Token no encontrado |
| CORS error | (bloqueado) | 0 | Backend sin CORS headers |
| Timeout | (ninguno) | 0 | Backend caído o muy lento |

---

## 🚀 PRÓXIMOS PASOS SUGERIDOS

### 1. Ejecutar diagnóstico completo
```bash
# En consola:
window.__apiDiagnostic.test()
# Copiar salida completa a un documento
```

### 2. Crear contribución y capturar token
```bash
# En /subscribe:
1. Llenar formulario
2. Copiar token de console
   [Subscribe] 🎫 Token: contrib_XXXXX

# Guardar este token para las pruebas siguientes
```

### 3. Probar getByToken con token real
```bash
window.__apiDiagnostic.testEndpoint('/api/contributions/contrib_XXXXX')
```

### 4. Si falla, capturar DevTools Network
- Abrir DevTools > Network tab
- Limpilar historial
- Ir a `/subscribe/contrib_XXXXX`
- Esperar error
- Buscar request a `/api/contributions/contrib_XXXXX`
- Click para ver detalles:
  - Headers > Request Headers (Authorization, Accept)
  - Response (si es HTML o JSON)
  - Timing (cuánto tardó)

### 5. Documentar y compartir
```
- Screenshot de console error
- DevTools Network tab screenshot
- Resultado de window.__apiDiagnostic.test()
- VITE_API_BASE_URL que estás usando
- URL de ngrok (si aplica)
```

---

## 📚 ARCHIVOS MODIFICADOS

✅ **src/infrastructure/repositories/ContributionsRepository.ts**
- Mejorado `fetchWithGuard()` con logging detallado
- Mejorado `getByToken()` con diagnósticos
- Header `ngrok-skip-browser-warning` automático

✅ **src/utils/apiDiagnostic.ts** (NUEVO)
- Herramienta interactiva para diagnosticar
- Tests de configuración, auth, CORS, health, endpoints
- Disponible globalmente: `window.__apiDiagnostic`

✅ **src/main.ts**
- Carga automática de apiDiagnostic en desarrollo

✅ **.env.development**
- Agregado: `VITE_DEBUG_HTTP=true`

---

## 💡 TIPS ÚTILES

### Limpiar cache de browser
```
DevTools > Application > Cache Storage > Delete All
DevTools > Application > Local Storage > Delete All
Reload con Ctrl+Shift+R (hard reload)
```

### Ver requests en tiempo real
```javascript
// Agregar a consola para ver todos los fetches
window._fetch = fetch
window.fetch = function(...args) {
  console.log('FETCH:', args[0], args[1])
  return window._fetch(...args)
}
```

### Testear backend directamente
```bash
# Linux/Mac:
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Accept: application/json" \
     http://localhost:5000/api/contributions/contrib_xxx

# PowerShell:
$headers = @{
  "Authorization" = "Bearer YOUR_TOKEN"
  "Accept" = "application/json"
}
Invoke-WebRequest -Uri "http://localhost:5000/api/contributions/contrib_xxx" `
  -Headers $headers -UseBasicParsing
```

---

## ❓ PREGUNTAS FRECUENTES

**P: ¿Por qué POST funciona pero GET no?**
R: POST crea recurso (a menudo sin validar auth headers tan estrictamente).
   GET recupera recurso específico (puede fallar si hay redirect o interfiere ngrok).

**P: ¿Cómo es que ngrok intersticial bloquea solo GET?**
R: Ngrok detecta requests de navegador. GET puede variar en headers, POST usa Content-Type consistente.

**P: ¿El problema es el token?**
R: No, porque POST devuelve el token correctamente. El problema está en cómo se recupera.

**P: ¿Debo cambiar el apiBaseUrl?**
R: Solo si está mal configurado. POST funciona, así que está bien. El problema es otra cosa.

---

## 📞 SOPORTE

Si después de estos pasos sigue fallando:

1. **Ejecuta el diagnóstico**: `window.__apiDiagnostic.test()`
2. **Abre DevTools > Network**
3. **Copia el error de consola**
4. **Copia el request/response del Network tab**
5. **Contacta soporte con toda esta información**

**Información importante a compartir**:
- Output de `window.__apiDiagnostic.test()`
- Captura de DevTools Network (request/response)
- URL de apiBaseUrl que estás usando
- Error exacto de la consola
- Si usas ngrok: URL del ngrok
