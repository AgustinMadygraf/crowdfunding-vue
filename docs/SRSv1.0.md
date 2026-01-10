
# SRS v1.0 — Portal Proyecto Madypack

## 1. Introducción

### 1.1 Propósito

Especificar requisitos funcionales y no funcionales del portal para informar el proyecto y permitir que el usuario **inicie y complete una suscripción** (mediante proveedor externo), con trazabilidad, evidencias públicas, y operación administrada por una sola persona.

### 1.2 Alcance

Incluye:

* Sitio público (landing + páginas) con etapas, avances y evidencias.
* Selección de “nivel de aporte” (denominaciones) y **inicio de suscripción**.
* **Pre-registro mínimo** + consentimiento. (DEPRECATED v1.1; reemplazado por Google Auth y contribuciones propias)
* Redirect a proveedor externo y consulta de estado.
* Backoffice (admin) para publicar etapas, evidencias, updates.
* Auditoría y métricas.

No incluye (en esta versión):

* Procesamiento de pagos dentro del sitio.
* KYC/AML completo dentro de Madypack (se delega al proveedor externo).
* Multi-admin.

### 1.3 Definiciones

* **Suscripción**: inicio de un proceso formal en un proveedor externo (ALyC/mercado/plataforma autorizada).
* **Milestone / Etapa**: hito del proyecto (1 a 6).
* **Evidencia**: documento o link verificable asociado a una etapa (con versionado + checksum).
* **Lead/Interesado**: usuario autenticado con Google que inició una contribución/suscripción.

---

## 2. Descripción general

### 2.1 Usuarios

* **Visitante público**: consume contenido, ve etapas/evidencias, inicia suscripción.
* **Admin (único)**: publica y gestiona contenido, evidencias, estados y exporta interesados.

### 2.2 Restricciones técnicas

* Frontend: Vue 3 + TypeScript + Vite.
* Diseño: CSS vanilla con Variables CSS (ver [docs/DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) para paleta, tipografía y componentes).
* Hosting: HTTPS obligatorio.
* Integración Chatwoot embebida (snippet en `index.html` o equivalente).
* Configuración por variables `VITE_*`.

**Nota (decisión v1.0):** Se eligió CSS custom en lugar de Bootstrap 5 para:
  - Mantener bundle ligero (~83 líneas vs ~30KB)
  - Facilitar personalización de Madygraf
  - Acelerar MVP (evitar 2+ semanas de refactor)
  - Mejor mantenibilidad y flexibilidad a largo plazo

### 2.3 Supuestos

* Existirá un **backend API** (mínimo) para persistencia, seguridad y auditoría.
* Existirá un **proveedor externo** de suscripción que soporte redirect + callback/webhook.

---

## 3. Requisitos funcionales

### 3.1 Navegación y páginas (router)

**FR-001** El sitio debe incorporar `vue-router` con rutas:

* `/` Landing (hero, etapas resumidas, CTA).
* `/etapas` Panel completo por etapas + evidencias.
* `/actualizaciones` Noticias/updates.
* `/documentos` Repositorio público de documentos (por categoría).
* `/suscribir` Pantalla/flujo de inicio (puede ser modal o página).
* `/admin` Backoffice (protegido).

**FR-002** Debe mantener navegación interna (anchors) como mejora, pero las secciones clave deben existir también como páginas para SEO.

---

### 3.2 Flujo de suscripción (core)

**FR-010** El usuario puede elegir un **nivel de aporte** (denominación) desde:

* Hero CTA y/o sección “Contribution”.

**FR-011** Al iniciar suscripción, el sistema debe:

1. Capturar UTM/campaign (si existe).
2. Autenticar con Google (v1.1; reemplaza FR-020).
3. Crear un “intento de suscripción” en backend.
4. Redirigir al `redirect_url` devuelto por backend (proveedor externo).

**FR-012** El flujo debe soportar estados:

* `interesado` → `iniciado` → `verificacion` → `confirmado` → `rechazado` → `expirado`
  y guardar:
* `provider_reference`
* `provider_status`

**FR-013** El frontend debe poder consultar el estado:

* Página `/suscribir/estado/:id` (o modal) que use `GET /api/subscriptions/:id`.

**FR-014** El redirect externo debe construirse sin PII en querystring; sólo permitir whitelist de parámetros (ej. `utm_*`, `campaign_id`) sanitizados.

---

### 3.3 Pre-registro y consentimiento — DEPRECATED (v1.1)

**FR-020** Antes de redirigir, el usuario debe completar pre-registro mínimo:

* `nombre` (obligatorio)
* `email` (obligatorio)
* `consentimiento` (obligatorio: checkbox)
* Opcionales: `telefono/whatsapp`, `provincia`, `tipo_interesado`, `rango_monto`

**FR-021** Validación frontend:

* Email válido.
* Nombre no vacío.
* Consentimiento obligatorio.
* Errores inline y accesibles.

**FR-022** Persistencia de consentimiento:

* Guardar `consent_text_version` y `consent_accepted_at` (ISO) en backend.

---

### 3.4 Panel público por etapas + evidencias públicas

**FR-030** El sistema debe mostrar el panel de etapas (1 a 6) con:

* Título, descripción, estado, fecha objetivo, monto objetivo, monto alcanzado, %.
* Dependencias / “qué habilita”.

**FR-031** Evidencias públicas por etapa:

* Listado de evidencias con: `tipo`, `título`, `versión`, `fecha`, `link`, `checksum_sha256`.

**FR-032** Versionado:

* Una evidencia puede tener múltiples versiones.
* El público ve historial (changelog) por evidencia o por documento.

**FR-033** Estados de publicación:

* Evidencias y updates deben tener `draft|published`.
* Público sólo ve `published`.

---

### 3.5 Actualizaciones (Updates)

**FR-040** Publicar posts de actualización con:

* categoría (Comercial/Técnico/Logística/Legal),
* fecha,
* contenido (texto),
* links a evidencias.

**FR-041** Suscriptores (opt-in) pueden recibir notificaciones por email (opcional v1.1; en v1.0 al menos dejar el hook preparado).

---

### 3.6 Chatwoot

**FR-050** Chatwoot debe estar disponible en todo el sitio.

**FR-051** (DEPRECATED v1.1) Después de pre-registro, el sitio debe ejecutar:

* `window.$chatwoot.setUser(...)`
* `setCustomAttributes({ status: 'interesado', subscription_id, level_id, utm... })`

**FR-052** (DEPRECATED v1.1) En el inicio de suscripción (`startContribution`) registrar evento/atributos en Chatwoot para trazabilidad.

---

### 3.7 Backoffice (admin único) - ❌ **DESCARTADO v1.0**

**Status:** NO se implementará en v1.0. Deferred a v2.0+.

**Alternativa v1.0:** Edición directa en `src/infrastructure/mockData.ts` + git push → GitHub Actions redeploy automático (2 min).

**Requisitos descartados:**
- **FR-060** Backoffice `/admin` con autenticación → v2.0+
- **FR-061** Gestión de etapas → v2.0+
- **FR-062** Gestión de evidencias → v2.0+
- **FR-063** Gestión de updates → v2.0+
- **FR-064** Gestión de suscripciones/leads → v2.0+
- **FR-065** Auditoría → v2.0+

**Impacto:** Simplifica MVP, acelera time-to-market. Gestión de contenido manual pero funcional.

---

## 4. Requisitos de API (backend mínimo)

### 4.1 Endpoints públicos

* `GET /api/milestones` (etapas publicadas)
* `GET /api/milestones/:id` (detalle + evidencias publicadas)
* `GET /api/updates` (posts publicados)
* `GET /api/documents` (docs publicados)

### 4.2 Suscripción

* `POST /api/subscriptions`

  * input: lead + level_id + utm + consent_version
  * output: `subscription_id`, `redirect_url`
* `GET /api/subscriptions/:id`

  * output: estado + provider_status + timestamps

### 4.3 Webhook del proveedor

* `POST /api/webhooks/provider`

  * headers: `X-Signature`, `X-Timestamp` (+ nonce si aplica)
  * body: evento con `event_id`, `provider_reference`, `status`

### 4.4 Admin

* `POST /api/admin/auth/magic-link` (o equivalente)
* `POST /api/admin/auth/verify` → token/sesión
* CRUD admin: milestones, evidences, updates, documents
* `GET /api/admin/audit-events`

---

## 5. Modelo de datos (mínimo)

### 5.1 Dominio público

**Milestone**

* `id, title, description, status, target_amount, raised_amount, target_date, published`

**Evidence**

* `id, milestone_id, type, title, url, checksum_sha256, version, status(draft|published), created_at`

**Update/Post**

* `id, category, title, content, status, published_at`

### 5.2 Suscripción

**Subscription**

* `id, lead_name, lead_email, level_id, status, provider_reference, provider_status, utm_json, consent_text_version, consent_accepted_at, created_at`

**WebhookEvent**

* `event_id, subscription_id/provider_reference, status, payload_hash, received_at` (para idempotencia)

### 5.3 Auditoría

**AuditEvent**

* `id, actor_id, action, entity_type, entity_id, before_json, after_json, timestamp, ip`

---

## 6. Requisitos no funcionales

### 6.1 Seguridad

**NFR-SEC-001** HTTPS obligatorio + HSTS.
**NFR-SEC-002** Autenticación admin con sesión segura (ideal cookie httpOnly) o JWT corto.
**NFR-SEC-003** Rate limit en `POST /api/subscriptions` y `POST /api/webhooks/provider`.
**NFR-SEC-004** Webhook con HMAC + timestamp y protección replay (nonce / ventana temporal) + idempotencia por `event_id`.
**NFR-SEC-005** Sanitización para contenido rich-text (si se habilita HTML): usar DOMPurify o equivalente.

> Hallazgo crítico: si el `.env` con tokens reales estuvo/está accesible o commiteado, se considera **compromiso**. Requisito: rotación de secretos y asegurar `.env` fuera del repo.

### 6.2 Privacidad

**NFR-PRIV-001** Consentimiento explícito y versionado (FR-022).
**NFR-PRIV-002** Política de retención (ej. 24 meses) y mecanismo de baja de comunicaciones.

### 6.3 Performance

**NFR-PERF-001** Lazy loading de rutas `/admin` y páginas pesadas.
**NFR-PERF-002** Assets comprimidos + caché (ETag/Cache-Control).

### 6.4 Observabilidad

**NFR-OBS-001** Log estructurado backend (errores, webhooks, auth, export).
**NFR-OBS-002** Métricas: conversion funnel (visita → inicio → pre-registro → redirect → confirmado).
**Nota v1.1:** Funnel actualizado (visita → login Google → contribución → pago → confirmado).

---

## 7. Requisitos SEO y medición

**NFR-SEO-001** Meta tags por ruta (title/description).
**NFR-SEO-002** OpenGraph (OG) para compartir en redes (al menos `/` y `/etapas`).
**NFR-SEO-003** Sitemap estático y robots.
**NFR-MKT-001** Captura de UTM en `main.ts` → `sessionStorage` y envío en `POST /api/subscriptions`.

---

## 8. Criterios de aceptación (mínimos)

1. Un visitante puede elegir nivel, completar pre-registro, aceptar consentimiento, y es redirigido con éxito a proveedor externo.
  (v1.1) Un visitante puede elegir nivel, autenticarse con Google, crear contribución y completar pago.
2. El backend guarda `subscription_id` y expone estado consultable.
3. El webhook actualiza estado con HMAC + idempotencia.
4. `/etapas` muestra etapas con evidencias públicas (version y checksum).
5. Admin puede publicar etapa/evidencia/update y queda auditado.
6. (v1.1) Chatwoot widget disponible para soporte; no se pre-cargan usuarios ni se marcan atributos desde el flujo de contribución.

---

## 9. Cambios técnicos requeridos en el frontend (desde el estado actual)

### ✅ Completados (2026-01-10)

* ✅ `vue-router@4` instalado y configurado con 8 rutas + lazy loading.
* ✅ App.vue dividido en páginas (HomeView, MilestonesView, UpdatesView, DocumentsView, SubscribeView, SubscriptionStatusView, AdminView, NotFoundView).
* ✅ Meta tags dinámicos por ruta (title, description).
* ✅ Navigation guard preparado para autenticación.
* ✅ Formulario de pre-registro creado en SubscribeView (FR-020 a FR-022) - **validación con Zod 100% funcional**.
* ✅ Captura UTM implementada en `main.ts` (NFR-MKT-001) - almacenamiento en sessionStorage + integración en SubscribeView.
* ✅ `src/infrastructure/api.ts` implementado (cliente HTTP con fetch + manejo de errores).
* ✅ DTOs completos en `src/infrastructure/dto.ts` (basados en SRS Sección 5).
* ✅ Servicios API: milestonesService, updatesService, documentsService (con mock fallback).
* ✅ useMilestones actualizado con soporte API (fallback a mocks).
* ✅ Validación de formularios con Zod (subscriptionFormSchema + useFormValidation).
* ✅ SubscribeView actualizado con validación en tiempo real y mensajes de error específicos.
* ✅ Composable `useChatwoot` para integración con widget (setUser, setCustomAttributes, waitForReady).
* ✅ Servicio `chatwootClientService` para Client API directo:
  - ✅ `createContact()` → POST /public/api/v1/inboxes/{id}/contacts
  - ✅ HMAC SHA256 (Web Crypto API)
  - ✅ Identifier único: `lead_<uuid>_<timestamp>`
  - ✅ Custom attributes flattened (14 campos)
  - ✅ Error handling con ChatwootException
  - ✅ **PROBADO EN VIVO:** Contactos se crean exitosamente en Chatwoot ✅
* ✅ SubscribeView integrado con Chatwoot: POST directo (sin backend propio).
* ✅ Logging estructurado con prefijos [Chatwoot] [Form] y niveles (info, warn, error).
* ✅ **Adaptación dinámica** a estructura real de respuesta Chatwoot.
* ✅ **Vite config** actualizado: allowedHosts para ngrok + desarrollo remoto.
* ✅ **Deploy.yml** actualizado con todas las variables Chatwoot requeridas:
  - `VITE_CHATWOOT_TOKEN`, `VITE_CHATWOOT_BASE_URL`
  - `VITE_CHATWOOT_INBOX_IDENTIFIER`, `VITE_CHATWOOT_HMAC_TOKEN` (nuevo)
* ✅ **`.env.example`** con instrucciones claras sobre dónde obtener cada variable.
* ✅ **Arquitectura final:** Chatwoot es el backend (SaaS) — no hay backend propio para suscripciones.
* ✅ **Milestone interface extendido** (14 campos: description, details, evidences[], timeline[], responsible, dependencies[], published).
* ✅ **mockData.ts expandido** con 6 etapas reales RKHA190 + descripciones + timeline items + evidencias.
* ✅ **MilestoneDetailModal.vue** creado (modal popup con todos los detalles, 400+ líneas, responsive).
* ✅ **MilestoneDetailView.vue** creado (página dedicada /etapas/:id con layout completo).
* ✅ **Router actualizado** con ruta /etapas/:id (props: true).
* ✅ **MilestoneCard clickeable** (emit show-details + routing).
* ✅ **MilestonesSection integrado** con modal (gestión de estado + eventos).
* ✅ **Update interface creado** (src/domain/update.ts: category, title, excerpt, content, status, publishedAt).
* ✅ **mockData.ts expandido con 8 updates reales** del proyecto RKHA190 (categorías: comercial, técnico, logística, legal).
* ✅ **UpdateCard.vue component** creado (tarjeta responsive con category badge, fecha, excerpt, hover effects).
* ✅ **UpdatesView.vue renovado** (hero + filtros por categoría + grid responsive + modal de detalle + ordenamiento por fecha).
* ✅ **Página /actualizaciones funcional** con 8 actualizaciones publicadas (FR-040, FR-041 completados al 95%).
* ✅ **Optimización CSS masiva completada** (2026-01-10):
  - ✅ Variables CSS centralizadas en base.css (--color-primary, --color-success, --category-comercial/tecnico/logistica/legal)
  - ✅ Clases reutilizables en components.css: card-base, card-clickable, container, container-narrow, section-padding, btn-base, btn-primary, btn-secondary, badge-status, badge-category, modal-backdrop, modal-content, modal-header, modal-body, modal-footer, progress-container, progress-bar, timeline-marker, timeline-content, filter-btn, filter-count, link-text
  - ✅ 15+ componentes refactorizados (~510 líneas CSS eliminadas): MilestoneCard, UpdateCard, UpdatesView, MilestoneDetailModal, MilestoneDetailView, HeroSection, ContributionSection, FaqSection, MilestonesSection, UpdatesSection, AppHeader, AppFooter, DocumentsView, SubscribeView, base.css
  - ✅ Layout utilities responsive (container max-width 1200px, container-narrow 960px, section-padding 80px/60px)
  - ✅ Código DRY sin duplicación, mantenible y escalable
  - ✅ Arquitectura CSS profesional lista para producción
* ✅ **SEO completo implementado** (2026-01-09):
  - ✅ Meta tags dinámicos en todas las rutas (router guard)
  - ✅ OpenGraph tags (Facebook): og:title, og:description, og:url, og:image, og:locale
  - ✅ Twitter cards: twitter:card, twitter:title, twitter:description, twitter:image
  - ✅ Canonical URLs dinámicos por ruta
  - ✅ Sitemap.xml con 5 URLs principales (changefreq, priority)
  - ✅ Robots.txt (indexación permitida, sitemap incluido)
  - ✅ Lang="es" en HTML
  - ✅ Keywords y author meta tags

### ⏳ Pendientes

* Integración con proveedor externo (Donweb) - si aplica en Fase 2.
* **Backoffice admin (FR-060 a FR-065) - Deferred a v2.0** (usar mockData.ts editing para v1.0).
* Testing E2E completo - Fase 2.
* Imagen OpenGraph (og-image.jpg 1200x630px) - opcional.

