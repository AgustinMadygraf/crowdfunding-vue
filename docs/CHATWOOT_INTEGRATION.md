# Integración Chatwoot — Formulario de pre-registro (Madygraf RKHA190)

**Documento técnico de diseño e implementación**  
**Fecha:** 2026-01-09  
**Status:** Design Review (Implementación pendiente de decisiones en Backend)

---

## 1. Contexto y objetivo

El portal de crowdfunding Madypack captura pre-registros mediante un formulario (Zod-validado) y necesita registrar trazabilidad en **Chatwoot** (actualmente en producción con web widget).

**Objetivo:** integrar el flujo de pre-registro con Chatwoot para:
- Crear/actualizar contactos en el inbox
- Registrar atributos personalizados (UTM, level, consent, etc.)
- Mantener historial de interacciones para soporte
- Validar identidad con HMAC (en producción)

**Scope:**
- Frontend (Vue 3): preparación y envío desde formulario
- Backend: creación de contactos, cálculo de HMAC, persistencia de `contact_identifier`
- No incluye: webhooks entrantes, resolución de conflictos complejos, multi-inbox

---

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
│  3. POST /api/subscriptions → backend                        │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ BACKEND (Python/Flask)                                      │
│                                                              │
│  4. Crear suscripción en DB                                 │
│  5. Calcular identifier_hash si needed                      │
│  6. POST /public/api/v1/inboxes/.../contacts → Chatwoot    │
│  7. Guardar chatwoot_source_id en DB                        │
│  8. Response: { subscription_id, redirect_url,              │
│                 chatwoot_identifier_hash }                  │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND (post-response)                                    │
│                                                              │
│  9. En chatwoot:ready event:                                │
│     - setUser(identifier, { identifier_hash })             │
│     - setCustomAttributes({ subscription_id, utm, ... })   │
│  10. Redirect a proveedor externo (si redirect_url)         │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Payloads

**Frontend → Backend (POST /api/subscriptions)**

```typescript
interface CreateSubscriptionRequest {
  lead: {
    name: string
    email: string
    phone?: string
    whatsapp?: string
    province?: string
    type?: 'persona' | 'empresa' | 'cooperativa' | 'otro'
    amount_range?: string
  }
  level_id: string
  consent: {
    accepted: boolean
    version: string
    accepted_at: string // ISO 8601
  }
  utm: {
    utm_source?: string
    utm_medium?: string
    utm_campaign?: string
    utm_term?: string
    utm_content?: string
    campaign_id?: string
    referrer?: string
    timestamp?: number
  }
}
```

**Backend → Frontend (Response 201)**

```typescript
interface CreateSubscriptionResponse {
  subscription_id: string
  redirect_url: string
  status: 'pre_registered' | 'iniciado'
  chatwoot_identifier?: string // subscription_id
  chatwoot_identifier_hash?: string // HMAC (si enforce = true)
  chatwoot_custom_attributes?: Record<string, string | number | boolean>
}
```

**Backend → Chatwoot (POST /public/api/v1/inboxes/.../contacts)**

```typescript
interface ChatwootCreateContactRequest {
  identifier: string // subscription_id
  identifier_hash: string // HMAC SHA256
  email: string
  name: string
  phone_number?: string
  custom_attributes: {
    subscription_id: string
    status: 'pre_registered'
    level_id: string
    amount_range?: string
    type?: string
    province?: string
    utm_source?: string
    utm_medium?: string
    utm_campaign?: string
    utm_term?: string
    utm_content?: string
    campaign_id?: string
    referrer?: string
    consent_version: string
    consent_accepted_at: string
  }
}
```

---

## 5. Decisiones pendientes (todavía no resueltas)

| Decisión | Opciones | Recomendación | Impacto |
|----------|----------|---------------|---------|
| **Inbox actual vs API-only** | Usar Website inbox para Client API calls / Crear inbox "API" dedicado | Website (más simple) | Si falla, cambiar a inbox "API" |
| **Crear conversación automática** | Sí (spam) / No (manual) | No (v1.0) | UX del soporte (será manual hasta v1.1) |
| **Enforce HMAC en dev** | Sí / No | No (dev), Sí (prod) | Complejidad local; simplificar testing |
| **Sincronizar teléfono** | Via `phone_number` campo / Via `custom_attributes` | `phone_number` | API nativa vs custom |
| **Datos históricos existentes** | Migrar / Empezar limpio | Empezar limpio | Si hay contacts viejos, ignorar |

---

## 6. Checklist de implementación

### Backend (Flask / Python)

- [ ] Variables de entorno:
  - [ ] `CHATWOOT_BASE_URL` (ej: `https://chatwoot.madygraf.com`)
  - [ ] `CHATWOOT_INBOX_IDENTIFIER` (obtener de Chatwoot)
  - [ ] `CHATWOOT_HMAC_TOKEN` (obtener de Chatwoot si enforce = true)

- [ ] Función helper: `compute_identifier_hash(identifier: str) -> str`
  - Usar `hmac.sha256(identifier.encode(), HMAC_TOKEN.encode()).hexdigest()`

- [ ] Servicio: `chatwoot_service.py`
  - Función: `create_or_update_contact(subscription_id, lead, level_id, utm, consent)`
  - Hacer POST a Chatwoot Client API
  - Capturar `source_id` → guardar en DB

- [ ] Endpoint `POST /api/subscriptions`:
  - [ ] Validar request
  - [ ] Crear subscription en DB (status = `pre_registered`)
  - [ ] Llamar `chatwoot_service.create_or_update_contact(...)`
  - [ ] Guardar `chatwoot_source_id` en tabla subscriptions
  - [ ] Response con `subscription_id`, `redirect_url`, `chatwoot_identifier_hash`

- [ ] (Opcional) Endpoint `GET /api/subscriptions/:id`:
  - [ ] Devolver status + `chatwoot_source_id` (para debugging)

### Frontend (Vue 3 / TypeScript)

- [ ] Composable `useChatwoot`:
  - [ ] Esperar evento `chatwoot:ready`
  - [ ] Métodos: `setUser(identifier, hash?)`, `setCustomAttributes(attrs)`
  - [ ] Error handling

- [ ] Actualizar `SubscribeView.vue`:
  - [ ] Tras POST /api/subscriptions exitoso:
    - [ ] Obtener `chatwoot_identifier_hash` del response
    - [ ] Llamar `useChatwoot().setUser(subscription_id, hash)`
    - [ ] Llamar `useChatwoot().setCustomAttributes({...})`
  - [ ] Luego: redirect o mostrar estado

- [ ] (Opcional) Página `SubscriptionStatusView.vue`:
  - [ ] GET /api/subscriptions/:id para mostrar estado
  - [ ] `setCustomAttributes({ status: 'iniciado' | 'verificacion' | ... })`

- [ ] Tests:
  - [ ] Mock `window.$chatwoot`
  - [ ] Verificar que se llama con payloads correctos
  - [ ] Error handling (ej: chatwoot:ready no dispara)

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
