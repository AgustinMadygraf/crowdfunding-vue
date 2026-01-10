# DEPRECATED v1.1 — Integración Chatwoot (Formulario de pre-registro)

Este documento fue archivado. A partir de v1.1, el flujo de suscripción usa autenticación de Google y backend propio de contribuciones. El widget de Chatwoot se mantiene únicamente para soporte.

Ver la versión archivada en: [docs/legacy/CHATWOOT_INTEGRATION.md](legacy/CHATWOOT_INTEGRATION.md)

Para el flujo actual, consultar:
- [FRONTEND_IMPLEMENTATION.md](FRONTEND_IMPLEMENTATION.md)
- [OBTAINING_CREDENTIALS.md](OBTAINING_CREDENTIALS.md)
- [MERCADOPAGO_INTEGRATION.md](MERCADOPAGO_INTEGRATION.md)

## 2. Capacidades confirmadas (lo que sí funciona)

### 2.1 Widget SDK (`window.$chatwoot`)

La API del widget está integrada en [index.html](../index.html) (líneas 12-32).

**Métodos disponibles:**

```javascript
// Evento: esperar antes de llamar métodos
window.addEventListener('chatwoot:ready', () => {
  // Setear usuario identificado
  window.$chatwoot.setUser(identifier, {
    name: 'Juan Pérez',
    email: 'juan@example.com',
    identifier_hash: 'abc123def...' // HMAC (opcional, recomendado en producción)
  })

  // Setear atributos customizados (JSON flattened, sin objetos anidados)
  window.$chatwoot.setCustomAttributes({
    subscription_id: 'sub_12345',
    status: 'pre_registered',
    level_id: 'Anticipo',
    utm_source: 'google',
    utm_medium: 'cpc',
    // ... más campos
  })

  // Ejecutar acciones (ej: abrir widget)
  window.$chatwoot.open()
})
```

**Limitaciones conocidas:**
- `custom_attributes` debe ser JSON flattened (sin objetos anidados)
- No hay documentación de límite exacto de campos/tamaño (recomendación: max 50 atributos, < 10KB total)
- `identifier_hash` es obligatorio si se activa "Forzar validación de identidad" en Chatwoot

### 2.2 Client API (pública) para crear/actualizar Contactos

**Endpoint base:** `POST /public/api/v1/inboxes/{inbox_identifier}/contacts`

```javascript
// Crear contacto (desde backend)
POST https://chatwoot.madygraf.com/public/api/v1/inboxes/{INBOX_IDENTIFIER}/contacts
{
  "identifier": "sub_12345_lead", // ID único en el inbox (string)
  "identifier_hash": "abc123...",  // HMAC SHA256(identifier, HMAC_TOKEN) — obligatorio si enforce identity
  "email": "juan@example.com",
  "name": "Juan Pérez",
  "phone_number": "+541112345678",
  "custom_attributes": {
    "subscription_id": "sub_12345",
    "status": "pre_registered",
    "level_id": "Anticipo",
    "utm_source": "google",
    "campaign_id": "summer_2026",
    // ... resumen de datos
  }
}

// Respuesta
{
  "contact": {
    "id": 123,
    "source_id": "sub_12345_lead", // identifier
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "custom_attributes": { ... }
  }
}
```

**Crear conversación (opcional):**

```javascript
POST /public/api/v1/inboxes/{INBOX_IDENTIFIER}/contacts/{SOURCE_ID}/conversations
{
  "custom_attributes": {
    "from": "api",
    "event_type": "pre_registered"
  }
}

// Respuesta
{
  "conversation": {
    "id": 456,
    "messages": [...]
  }
}
```

**Crear mensaje en conversación:**

```javascript
POST /public/api/v1/inboxes/{INBOX_IDENTIFIER}/contacts/{SOURCE_ID}/conversations/{CONVERSATION_ID}/messages
{
  "content": "Lead pre-registrado: Juan Pérez - Nivel: Anticipo - UTM: google/cpc"
}
```

> Ver documentación oficial: https://developers.chatwoot.com/docs/product/channels/api/client-apis

---

## 3. Decisiones de diseño (recomendaciones)

### 3.1 Identificador único en Chatwoot

**Opción elegida:** `subscription_id`

- Es único por suscripción (1:1)
- Generado por backend, estable
- Evita duplicados si hay re-submissions
- Fácil de sincronizar entre sistemas

**Formato sugerido:**
```
sub_<timestamp>_<uuid> 
ej: sub_1704753600_a1b2c3d4
```

### 3.2 ¿Crear conversación automáticamente?

**Recomendación:** No (para v1.0)

- Razón: evitar spam de conversaciones automáticas
- Alternativa: crear conversación solo si el usuario escribe en el widget o admin activa manualmente
- Futuro (v1.1): webhook de estado → auto-conversación con updates

### 3.3 Qué datos enviar a Chatwoot (resumen)

**Incluir (atributos):**

| Campo | Tipo | Ejemplo | Propósito |
|-------|------|---------|-----------|
| `subscription_id` | string | `sub_1704753600_a1b2c3d4` | Trazabilidad |
| `status` | string | `pre_registered` | Estado del lead |
| `level_id` | string | `Anticipo` | Monto / producto |
| `amount_range` | string | `100000_200000` | Rango aportante |
| `type` | string | `persona` | Tipo de interesado |
| `province` | string | `Buenos Aires` | Ubicación |
| `utm_source` | string | `google` | Marketing |
| `utm_medium` | string | `cpc` | Marketing |
| `utm_campaign` | string | `madypack_v1` | Marketing |
| `utm_term` | string | `crowdfunding` | Marketing |
| `utm_content` | string | `banner_hero` | Marketing |
| `campaign_id` | string | `summer_2026` | Campaña interna |
| `referrer` | string | `facebook.com` | Referencia |
| `consent_version` | string | `1.0` | Control legal |
| `consent_accepted_at` | string | `2026-01-09T12:00:00Z` | Timestamp legal |

**No incluir en atributos:**
- Datos binarios o archivos
- Contenido HTML/rich text (aplanar o sanitizar)
- Objetos anidados (convertir a strings JSON si es necesario)

### 3.4 Validación de identidad (HMAC)

**Para producción:**

1. Activar en Chatwoot: Settings → Inboxes → {tu inbox} → "Forzar validación de identidad"
2. Backend calcula:
   ```
   identifier_hash = HMAC-SHA256(identifier, CHATWOOT_HMAC_TOKEN)
   ```
3. Frontend recibe `identifier_hash` desde backend → pasa a `setUser()`

**Para desarrollo:**

- Dejar sin HMAC (más simple para testing)
- Cambiar en producción

---

## 4. Arquitectura propuesta (flujo de ejecución)

### 4.1 Diagrama (texto)

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND (Vue 3 / SubscribeView)                            │
│                                                              │
│  1. Usuario completa formulario (validado con Zod)          │
│  2. Click en "Continuar"                                     │
│  3. POST /public/api/v1/inboxes/.../contacts → Chatwoot    │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ CHATWOOT (Backend SaaS)                                     │
│                                                              │
│  4. Crear/actualizar contacto                              │
│  5. Response: { contact.id, contact.source_id }            │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND (post-response)                                    │
│                                                              │
│  6. En chatwoot:ready event:                                │
│     - setUser(identifier, { name, email, identifier_hash }) │
│     - setCustomAttributes({ subscription_id, utm, ... })    │
│  7. Mostrar página de éxito o redirect (si aplica)          │
└─────────────────────────────────────────────────────────────┘
```

**Diferencia clave vs arquitectura anterior:** No hay backend intermedio. El frontend llama directamente a Chatwoot Client API.

### 4.2 Payloads

**Frontend → Chatwoot Client API (POST /public/api/v1/inboxes/.../contacts)**

```json
{
  "identifier": "lead_<uuid>_<timestamp>",
  "identifier_hash": "abc123def...",
  "email": "juan@example.com",
  "name": "Juan Pérez",
  "phone_number": "+541112345678",
  "custom_attributes": {
    "form_source": "web_widget",
    "level_id": "Anticipo",
    "amount_range": "100000_200000",
    "type": "persona",
    "province": "Buenos Aires",
    "utm_source": "google",
    "utm_medium": "cpc",
    "utm_campaign": "madypack_v1",
    "utm_term": "crowdfunding",
    "utm_content": "banner_hero",
    "campaign_id": "summer_2026",
    "referrer": "facebook.com",
    "consent_version": "1.0",
    "consent_accepted_at": "2026-01-09T12:00:00Z"
  }
}
```

**Chatwoot → Frontend (Response 200)**

```json
{
  "contact": {
    "id": 123,
    "source_id": "lead_<uuid>_<timestamp>",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "phone_number": "+541112345678",
    "custom_attributes": { ... }
  }
}
```

---

## 5. Decisiones pendientes (todavía no resueltas)

| Decisión | Opciones | Recomendación | Impacto |
|----------|----------|---------------|---------|
| **CORS / HMAC signing** | Usar CORS públicamente / Usar backend proxy para HMAC | Usar CORS (si permite) o requiere proxy mínimo para HMAC | Si Chatwoot no permite CORS, necesitamos proxy |
| **Identificador único** | `lead_<uuid>_<timestamp>` / `<email>` / `<subscription_id>` | `lead_<uuid>_<timestamp>` (evita duplicados) | Qué se considera "mismo usuario" |
| **Enforce HMAC en dev** | Sí / No | No (dev), Sí (prod) | Complejidad local; simplificar testing |
| **Conversación automática** | Sí (crear) / No (solo contacto) | No (v1.0) | UX del soporte |
| **Datos históricos existentes** | Migrar / Empezar limpio | Empezar limpio | Si hay contacts viejos, ignorar |

---

## 6. Checklist de implementación

### Frontend (Vue 3)

- [ ] Variables de entorno:
  - [x] `VITE_CHATWOOT_TOKEN` (widget token)
  - [x] `VITE_CHATWOOT_BASE_URL` (base URL)
  - [ ] `VITE_CHATWOOT_INBOX_IDENTIFIER` (para Client API)
  - [ ] `VITE_CHATWOOT_HMAC_TOKEN` (opcional, solo si enforce = true)

- [ ] Servicio: `chatwootClientService.ts`
  - Función: `createContact(lead, level_id, utm, consent)`
  - POST `/public/api/v1/inboxes/{INBOX_IDENTIFIER}/contacts`
  - Retornar `{ contact.id, contact.source_id }`
  - Error handling

- [ ] Actualizar `SubscribeView.vue`:
  - [ ] Tras validar formulario:
    - [ ] Generar `identifier = lead_<uuid>_<timestamp>`
    - [ ] Calcular `identifier_hash = HMAC(identifier, HMAC_TOKEN)` (si enforce)
    - [ ] Llamar `chatwootClientService.createContact(...)`
  - [ ] Si éxito:
    - [ ] Obtener `contact.source_id`
    - [ ] Llamar `setUser(source_id, { name, email, identifier_hash })`
    - [ ] Llamar `setCustomAttributes({...})`
    - [ ] Mostrar página de éxito

- [ ] (Opcional) Crear `useSubscription` composable:
  - Loading, error, success states
  - Reutilizable en otras vistas

### Tests

- [ ] Mock `fetch` / `axios` para Client API
- [ ] Verificar que payloads sean válidos
- [ ] Error handling (CORS, timeout, etc.)

---

**No hay backend propio.** Chatwoot es el backend.

---

## 7. Testing rápido

### Paso 1: Setup local

```bash
# En .env (frontend)
VITE_API_BASE_URL=http://localhost:5000
VITE_CHATWOOT_TOKEN=3eM8KFPSeThEnQwyCLbLzKmi
VITE_CHATWOOT_BASE_URL=https://chatwoot.madygraf.com

# En backend .env
CHATWOOT_BASE_URL=https://chatwoot.madygraf.com
CHATWOOT_INBOX_IDENTIFIER=<obtener de Chatwoot UI>
CHATWOOT_HMAC_TOKEN=<obtener de Chatwoot Settings si enforce=true>
```

### Paso 2: Enviar formulario

1. Nav a `/suscribir`
2. Seleccionar nivel
3. Llenar form (nombre, email, etc.)
4. Click "Continuar"

### Paso 3: Verificar

**En backend logs:**
```
POST /api/subscriptions → 201
POST /public/api/v1/inboxes/.../contacts → 200
subscription_id = sub_1704753600_a1b2c3d4
chatwoot_source_id = sub_1704753600_a1b2c3d4
```

**En Chatwoot (https://chatwoot.madygraf.com):**
1. Inbox → Contacts
2. Buscar por email
3. Verificar que existe contacto con attributes (subscription_id, utm_source, etc.)

**En página del sitio:**
- Si redirect_url está en response → se redirige al proveedor
- Si no → ver estado en la página (preparación para SubscriptionStatusView)

**En widget Chatwoot (esquina inferior derecha):**
- Widget pre-cargado con `setUser()` → muestra nombre/email
- Custom attributes visibles en el sidebar (cuando agent abre)

---

## 8. Referencias y enlaces útiles

| Recurso | URL | Nota |
|---------|-----|------|
| Chatwoot SDK (Widget) | https://developers.chatwoot.com/docs/product/channels/live-chat/sdk-api | `window.$chatwoot.setUser()` |
| Chatwoot Custom Attributes | https://developers.chatwoot.com/docs/product/channels/live-chat/sdk-api#custom-attributes | JSON flattened |
| Client API (Contacts) | https://developers.chatwoot.com/docs/product/channels/api/client-apis | POST /contacts |
| Client API (Conversations) | https://developers.chatwoot.com/docs/product/channels/api/client-apis | POST /conversations |
| Identity Validation (HMAC) | https://developers.chatwoot.com/docs/product/channels/live-chat/sdk-api#identity-validation | SHA256 |

---

## 9. Logs de cambios y próximas iteraciones

### v1.0 (MVP - Enero 2026)

- [x] Widget Chatwoot en producción
- [ ] Crear contacto en Chatwoot al pre-registrarse (sin HMAC)
- [ ] Setear custom attributes (UTM, level, consent)
- [ ] Sin validación de identidad (HMAC = opcional)

### v1.1 (Post-MVP)

- [ ] Activar validación HMAC (más seguro)
- [ ] Crear conversación automática con resumen
- [ ] Webhook: actualizar custom attributes cuando cambie status
- [ ] Página de estado de suscripción → sincronizar con Chatwoot

### v2.0 (Backoffice)

- [ ] Admin puede ver leads en Chatwoot (filtro + export)
- [ ] Webhook entrante: agent puede cambiar status desde Chatwoot → sync a backend
- [ ] Auditoría: loguear todas las interacciones Chatwoot ↔ Backend

---

**Documento revisado:** 2026-01-09  
**Próxima revisión:** Post-implementación backend  
**Propietario:** DevTeam Madygraf
