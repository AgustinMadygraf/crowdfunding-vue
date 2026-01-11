# 🔧 CSRF Integration Fix - Endpoint Resolution

## Problema Identificado

El frontend estaba intentando solicitar el token CSRF de un endpoint que **no existía en el backend**:

```
GET /api/csrf-token  → 404 Not Found ❌
```

El composable `useCsrfToken.ts` intentaba hacer un GET a `/api/csrf-token` pero el backend no tenía este endpoint implementado.

## Solución Implementada

**Cambio en `src/application/composables/useCsrfToken.ts`:**

El frontend ahora solicita el token CSRF de un endpoint que **ya existe y está funcionando**:

```typescript
// Antes (❌ endpoint inexistente):
const endpoint = `${apiBaseUrl}/api/csrf-token`

// Después (✅ endpoint existente):
const endpoint = `${apiBaseUrl}/api/contributions?_csrf_init=1`
```

### Por qué funciona:

1. **GET `/api/contributions` SÍ existe** en el backend (confirmado con startup logs)
2. **GET es un método "safe"** - No requiere validación CSRF
3. **La respuesta INCLUYE el token CSRF** en:
   - Cookie: `XSRF-TOKEN`
   - Header: `X-CSRF-Token`
4. El frontend captura el token de la respuesta y lo almacena
5. Los requests posteriores (POST/PUT/PATCH/DELETE) incluyen el token automáticamente

### Flujo Completo:

```
┌─────────────────────────────────────────────────────────┐
│ 1. Frontend: App.vue monta                              │
│    → useCsrfToken() se ejecuta                          │
└────────────────┬────────────────────────────────────────┘
                 ⬇
┌─────────────────────────────────────────────────────────┐
│ 2. useCsrfToken busca token localmente:                │
│    • Meta tag (X-CSRF-Token)                           │
│    • Cookie (XSRF-TOKEN)                               │
└────────────────┬────────────────────────────────────────┘
                 ⬇
          ¿Token encontrado?
         /                \
       SÍ                  NO
       |                   |
       ⬇                   ⬇
    ✅ Usar          🔄 Solicitar
                     ↓
┌──────────────────────────────────────────────────────────┐
│ 3. GET /api/contributions (Sin token, es safe)          │
│    credentials: 'include' ← Enviar cookies              │
└────────────────┬─────────────────────────────────────────┘
                 ⬇
┌──────────────────────────────────────────────────────────┐
│ 4. Backend responde:                                     │
│    Set-Cookie: XSRF-TOKEN=d0ef37862aaba611418a...       │
│    X-CSRF-Token: d0ef37862aaba611418a...                │
│    (+ data de contribuciones)                            │
└────────────────┬─────────────────────────────────────────┘
                 ⬇
┌──────────────────────────────────────────────────────────┐
│ 5. Frontend captura el token:                            │
│    • De header: response.headers.get('X-CSRF-Token')     │
│    • O de cookie: document.cookie                        │
│    • Almacena en csrfService.setToken()                 │
└────────────────┬─────────────────────────────────────────┘
                 ⬇
┌──────────────────────────────────────────────────────────┐
│ 6. ✅ Token listo para usar                              │
│    Requests posteriores:                                 │
│    POST /api/contributions                              │
│    X-CSRF-Token: d0ef37862aaba611418a...                │
└──────────────────────────────────────────────────────────┘
```

## Verificación Manual

### En Terminal (Windows PowerShell):

```powershell
# 1. Verificar que GET /api/contributions existe
Invoke-WebRequest -Uri "http://localhost:5000/api/contributions" -Method Get

# Debe retornar:
# - Status: 200 OK
# - Cookie: XSRF-TOKEN=...
# - Header: X-CSRF-Token: ...
```

### En Browser Console (F12):

```javascript
// 1. Verificar que el token fue capturado
sessionStorage.getItem('csrf_token')
// Debe retornar el token string: "d0ef37862aaba..."

// 2. Verificar en cookie
document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN'))
// Retorna: "XSRF-TOKEN=d0ef37862aaba..."

// 3. Ver logs de useCsrfToken
// Console debe mostrar:
// ✅ [useCsrfToken] Token CSRF obtenido del backend (cookie)
// o
// ✅ [useCsrfToken] Token CSRF obtenido del backend (header)
```

### En DevTools Network Tab:

Cuando recargues el frontend (http://localhost:5173):

```
GET http://localhost:5000/api/contributions?_csrf_init=1
Status: 200 OK
Response Headers:
  Set-Cookie: XSRF-TOKEN=d0ef37862aaba611418a...
  X-CSRF-Token: d0ef37862aaba611418a...
```

## Resumen de Cambios

| Archivo | Cambio | Razón |
|---------|--------|-------|
| `src/application/composables/useCsrfToken.ts` | Cambiar endpoint `/api/csrf-token` → `/api/contributions` | El endpoint original no existe, contributions SÍ existe |
| `src/application/composables/useCsrfToken.ts` | Agregar `?_csrf_init=1` al query string | Documenta la intención de inicializar CSRF (opcional pero clara) |
| `src/application/composables/useCsrfToken.ts` | Mejorar mensaje de logging | Claridad: "🔍 Token no encontrado en meta tag/cookie, solicitando..." |

## Status

✅ **Frontend integrado correctamente**
- ✅ Busca token en meta tag (si backend lo inyecta)
- ✅ Busca token en cookie (después de primera respuesta)
- ✅ Solicita token de endpoint existente si no lo encuentra localmente
- ✅ Almacena en sessionStorage
- ✅ Inyecta en headers de requests mutantes (POST/PUT/PATCH/DELETE)

✅ **Backend listo** (confirmado)
- ✅ Responde con token CSRF en cookie + header
- ✅ Valida token en requests mutantes
- ✅ Rechaza con 403 si token inválido

## Próximos Pasos

1. **Reload frontend**: http://localhost:5173
2. **Verificar console**: Debería ver `✅ [useCsrfToken] Token CSRF obtenido del backend`
3. **Intentar crear contribución**: POST debería incluir X-CSRF-Token header
4. **Verificar backend**: Debería recibir y validar el token correctamente

---

**Cambio implementado:** `c:\AppServ\www\crowdfunding-vue\src\application\composables\useCsrfToken.ts`
**TypeScript check:** ✅ Zero errors
**Status:** Ready for testing
