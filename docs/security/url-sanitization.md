# Sanitización de URLs - Protección XSS

## 📋 Resumen

Se ha implementado sanitización de URLs para prevenir ataques XSS (Cross-Site Scripting) a través de URLs maliciosas en avatares de usuario.

## 🔒 Problema de Seguridad Resuelto

**Vulnerabilidad:** URLs de avatar sin validación permitían inyección de código JavaScript.

**Ejemplo de ataque:**
```javascript
user.avatar_url = "javascript:alert('XSS')"
// En el template:
<img :src="user.avatar_url"> // ❌ Vulnerable
```

## ✅ Solución Implementada

### 1. Utilidad de Sanitización (`src/utils/urlSanitizer.ts`)

Tres funciones principales:

#### `isUrlSafe(url: string): boolean`
Valida si una URL es segura verificando:
- ✅ Protocolo permitido (http, https, data)
- ✅ Dominio en whitelist
- ✅ Sin patrones XSS (`javascript:`, `<script>`, `onerror=`, etc.)

#### `sanitizeAvatarUrl(url: string, fallback?: string): string`
Sanitiza URLs de avatares:
- Si es segura → retorna URL original
- Si no es segura → retorna avatar por defecto (SVG data URL)

#### `sanitizeUrl(url: string): string | null`
Sanitiza URLs genéricas:
- Si es segura → retorna URL original
- Si no es segura → retorna `null`

### 2. Whitelist de Dominios

Dominios confiables para avatares:
```typescript
- lh3.googleusercontent.com  // Google
- avatars.githubusercontent.com  // GitHub
- graph.facebook.com  // Facebook
- secure.gravatar.com  // Gravatar
```

### 3. Aplicación en Componentes

**Antes (vulnerable):**
```vue
<img :src="user.avatar_url" />
```

**Después (seguro):**
```vue
<script setup>
import { sanitizeAvatarUrl } from '@/utils/urlSanitizer'
</script>

<template>
  <img :src="sanitizeAvatarUrl(user.avatar_url)" />
</template>
```

**Componentes actualizados:**
- ✅ [SubscribeView.vue](src/views/SubscribeView.vue)
- ✅ [UserDashboardView.vue](src/views/UserDashboardView.vue)
- ✅ [GoogleAuthButton.vue](src/components/auth/GoogleAuthButton.vue)

## 🧪 Testing

Suite de tests completa: `src/utils/__tests__/urlSanitizer.spec.ts`

**Cobertura:**
- ✅ URLs legítimas (Google, GitHub, Gravatar)
- ✅ Data URLs de imágenes
- ✅ Vectores XSS comunes (javascript:, vbscript:, etc.)
- ✅ Inyección de eventos (onerror, onload)
- ✅ Tags HTML maliciosos
- ✅ Dominios no confiables
- ✅ URLs malformadas

**Ejecutar tests:**
```bash
npm run test:unit -- urlSanitizer
```

## 🛡️ Vectores XSS Bloqueados

1. **JavaScript Protocol:**
   ```
   javascript:alert('XSS')
   ```

2. **VBScript Protocol:**
   ```
   vbscript:msgbox('XSS')
   ```

3. **Data URLs HTML:**
   ```
   data:text/html,<script>alert('XSS')</script>
   ```

4. **Event Handlers:**
   ```
   https://example.com/x.jpg" onerror="alert('XSS')"
   ```

5. **Script Tags:**
   ```
   https://example.com/<script>alert('XSS')</script>
   ```

6. **Case Variations:**
   ```
   JaVaScRiPt:alert(1)
   ```

## 📖 Uso en Nuevos Componentes

Para cualquier componente que muestre avatares o imágenes externas:

```vue
<script setup lang="ts">
import { sanitizeAvatarUrl } from '@/utils/urlSanitizer'

const user = ref<User | null>(null)
</script>

<template>
  <!-- Para avatares -->
  <img 
    v-if="user?.avatar_url" 
    :src="sanitizeAvatarUrl(user.avatar_url)"
    :alt="user.nombre"
  />
  
  <!-- Para otras imágenes con fallback custom -->
  <img 
    :src="sanitizeAvatarUrl(imageUrl, '/assets/placeholder.png')"
  />
</template>
```

## 🔍 Validación en Backend

**Importante:** Esta sanitización es solo en frontend. El backend **DEBE** también validar:

```python
# Ejemplo backend
from urllib.parse import urlparse

ALLOWED_DOMAINS = [
    'lh3.googleusercontent.com',
    'avatars.githubusercontent.com',
    # ...
]

def is_avatar_url_safe(url: str) -> bool:
    try:
        parsed = urlparse(url)
        return (
            parsed.scheme in ['http', 'https'] and
            parsed.netloc in ALLOWED_DOMAINS
        )
    except:
        return False
```

## 📊 Impacto

**Seguridad:**
- 🔒 Protección contra XSS a través de avatares
- 🔒 Validación en cliente antes de renderizar
- 🔒 Fallback seguro para URLs inválidas

**Performance:**
- ⚡ Validación en tiempo de renderizado (no hay overhead)
- ⚡ Avatar SVG por defecto embebido (no requiere HTTP request)

**UX:**
- ✅ Avatares maliciosos son reemplazados automáticamente
- ✅ No se muestran errores al usuario
- ✅ Logs en consola para debugging

## 🚀 Próximos Pasos

1. **CSP Mejorado:** Agregar `img-src` restrictivo en [vite.config.ts](vite.config.ts)
   ```typescript
   'img-src': 'self data: https://lh3.googleusercontent.com https://avatars.githubusercontent.com'
   ```

2. **Validación Backend:** Implementar whitelist en API

3. **Monitoring:** Agregar telemetría para URLs bloqueadas

4. **Extensión:** Aplicar a otras imágenes externas (banners, documentos, etc.)

## 📚 Referencias

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Trusted Types API](https://web.dev/trusted-types/)

---

**Autor:** GitHub Copilot  
**Fecha:** 2026-01-11  
**Ticket:** SECURITY-001 - XSS en Avatar URLs
