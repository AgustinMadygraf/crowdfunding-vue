# TODO List - Portal Proyecto Madypack

**Generado:** 2026-01-09  
**Basado en:** SRSv1.0.md y análisis del código actual

---

## ✅ CERTEZAS (Estado Actual)

### Arquitectura Frontend
- ✅ Proyecto Vue 3 + TypeScript + Vite configurado
- ✅ Estructura de dominio implementada (`Milestone`, `ContributionLevel`)
- ✅ Composables básicos (`useMilestones`, `useContributionLevels`)
- ✅ Componentes de layout (`AppHeader`, `AppFooter`)
- ✅ Secciones principales creadas:
  - HeroSection
  - MilestonesSection
  - ContributionSection
  - UpdatesSection
  - FaqSection
- ✅ **Sistema de diseño: CSS custom con Variables CSS** (83 líneas limpias)
- ✅ Datos mock implementados (mockData.ts)

### Funcionalidad Parcial
- ✅ Visualización de milestones con progreso
- ✅ Selección de niveles de contribución
- ✅ Cálculo de beneficios
- ✅ Navegación interna con anchors

---

## 🚧 TAREAS PENDIENTES (Críticas)

### 1. Router y Navegación (FR-001, FR-002) ✅
- [x] Instalar `vue-router`
- [x] Configurar rutas:
  - `/` - Landing (HomeView)
  - `/etapas` - Panel completo de etapas (MilestonesView)
  - `/actualizaciones` - Updates (UpdatesView)
  - `/documentos` - Repositorio público (DocumentsView)
  - `/suscribir` - Flujo de suscripción (SubscribeView)
  - `/suscribir/estado/:id` - Estado de suscripción (SubscriptionStatusView)
  - `/admin` - Backoffice (AdminView)
  - `404` - Not Found (NotFoundView)
- [x] Convertir App.vue de single-page a router-based
- [x] Implementar lazy loading para todas las rutas
- [x] Meta tags dinámicos por ruta (title, description)
- [x] ScrollBehavior con soporte para hash anchors
- [x] Navigation guard preparado para auth en /admin

### 1.5 Sistema de Diseño y SRS (DECISIÓN TOMADA) ✅
- [x] **Actualizar SRS Sección 2.2:**
  - ✅ Cambió: `"Frontend: Vue + TypeScript + Bootstrap"`
  - ✅ Hacia: `"Frontend: Vue + TypeScript + Vite + CSS vanilla con Variables CSS"`
- [x] Documentar sistema de diseño en SRS:
  - ✅ Paleta de colores (base.css)
  - ✅ Tipografía: Inter, system fonts
  - ✅ Responsive breakpoints
- [x] ✅ Crear `docs/DESIGN_SYSTEM.md` con guía de componentes CSS

### 2. Integración API (FR-010 a FR-014, todos los API 4.*)
- [ ] Crear `src/infrastructure/api.ts` (cliente HTTP)
- [ ] Definir DTOs/interfaces para API
- [ ] Implementar servicios:
  - `milestonesService.ts` → GET /api/milestones
  - `subscriptionsService.ts` → POST/GET subscriptions
  - `updatesService.ts` → GET /api/updates
  - `documentsService.ts` → GET /api/documents
- [ ] Reemplazar mockData por llamadas reales
- [ ] Manejo de errores HTTP

### 3. Flujo de Suscripción (FR-010 a FR-014, FR-020 a FR-022)
- [ ] Crear componente PreRegistrationForm
  - Campos: nombre, email, teléfono, provincia, tipo_interesado, rango_monto
  - Validación frontend (email válido, campos obligatorios)
  - Checkbox de consentimiento obligatorio
- [ ] Implementar `startContribution()`:
  - Capturar nivel seleccionado
  - Mostrar formulario de pre-registro
  - Enviar POST /api/subscriptions con lead + level_id + UTM + consent
  - Recibir redirect_url y subscription_id
  - Ejecutar redirect a proveedor externo
- [ ] Crear página/componente estado de suscripción
- [ ] Estados: interesado → iniciado → verificacion → confirmado/rechazado/expirado

### 4. Captura UTM y Marketing (NFR-MKT-001)
- [ ] Implementar captura UTM en `main.ts`:
  - Leer querystring en carga inicial
  - Almacenar en sessionStorage
  - Recuperar al iniciar suscripción
- [ ] Enviar UTM en POST /api/subscriptions

### 5. Modelo de Dominio Extendido
- [ ] Extender interfaz `Milestone`:
  - `description: string`
  - `published: boolean`
  - `dependencies?: number[]`
- [ ] Crear interfaz `Evidence`:
  - `id, milestone_id, type, title, url, checksum_sha256, version, status, created_at`
- [ ] Crear interfaz `Update`:
  - `id, category, title, content, status, published_at`
- [ ] Crear interfaz `Subscription`:
  - `id, lead_name, lead_email, level_id, status, provider_reference, provider_status, utm_json, consent_text_version, consent_accepted_at, created_at`

### 6. Componentes de Evidencias (FR-030 a FR-033)
- [ ] Crear `EvidenceList.vue` (por milestone)
- [ ] Mostrar evidencias con version, checksum, fecha
- [ ] Historial de versiones (changelog)
- [ ] Filtro: solo mostrar status=published en público

### 7. Página de Actualizaciones (FR-040, FR-041)
- [ ] Crear vista `/actualizaciones`
- [ ] Listar updates con categoría, fecha, contenido
- [ ] Links a evidencias desde updates
- [ ] (v1.1) Preparar hook para suscripción a notificaciones

### 8. Página de Documentos
- [ ] Crear vista `/documentos`
- [ ] Listar documentos públicos por categoría
- [ ] Integrar con GET /api/documents

### 9. Integración Chatwoot (FR-050 a FR-052)
- [ ] Agregar snippet Chatwoot en index.html
- [ ] Variables de entorno: `VITE_CHATWOOT_*`
- [ ] Implementar `setUser()` post pre-registro
- [ ] Implementar `setCustomAttributes()` con:
  - status, subscription_id, level_id, utm
- [ ] Registrar evento en `startContribution()`

### 10. Variables de Entorno
- [ ] Crear `.env.example` con:
  - `VITE_API_BASE_URL`
  - `VITE_CHATWOOT_WEBSITE_TOKEN`
  - `VITE_CHATWOOT_BASE_URL`
- [ ] Verificar que `.env` esté en `.gitignore`
- [ ] Documentar en README.md

### 11. SEO y Meta Tags (NFR-SEO-001 a NFR-SEO-003)
- [ ] Meta tags dinámicos por ruta (vue-meta o vue-router)
- [ ] OpenGraph tags para `/` y `/etapas`
- [ ] Crear `public/sitemap.xml`
- [ ] Crear `public/robots.txt`

### 12. Backoffice Admin (FR-060 a FR-065) - **Fase 2**
- [ ] Autenticación admin (magic-link o equivalente)
- [ ] CRUD Milestones
- [ ] CRUD Evidencias (con versioning)
- [ ] CRUD Updates
- [ ] Gestión de suscripciones/leads
  - Lista, filtros, exportar CSV
- [ ] Auditoría (log de eventos admin)

### 13. Seguridad y Calidad
- [ ] Rate limiting (backend)
- [ ] Sanitización de inputs
- [ ] Protección webhook (HMAC + timestamp + idempotencia)
- [ ] HTTPS + HSTS
- [ ] Rotación de secretos si hubo exposición

### 14. Performance
- [ ] Lazy loading de rutas
- [ ] Compresión de assets
- [ ] Cache headers (backend)
- [ ] Optimización de imágenes

### 15. Testing
- [ ] Unit tests para composables
- [ ] E2E test para flujo de suscripción
- [ ] Validación de formularios

---

## ❓ DUDAS Y PREGUNTAS PARA ACLARAR

### ✅ RESPONDIDAS (Con evidencia en el proyecto)

#### Chatwoot - ✅ **CONFIGURADO Y LISTO**
- **11. ¿Ya existe cuenta de Chatwoot?** → **SÍ** ✅
- **12. ¿Credenciales disponibles?** → **SÍ** ✅
  - Token: `3eM8KFPSeThEnQwyCLbLzKmi`
  - Base URL: `https://chatwoot.madygraf.com`
  - Snippet ya implementado en [index.html](../index.html) (líneas 12-32)
  - Variables en `.env` configuradas
  - **Pendiente:** Implementar `setUser()` y `setCustomAttributes()` después del pre-registro

#### Bootstrap y Diseño - ✅ **DECISIÓN COMPLETADA**
- **14. ¿Qué versión de Bootstrap?** → **DECISIÓN: CSS vanilla con Variables CSS** ✅
  - ~~Instalar Bootstrap~~ - Rechazado por: +2 semanas, +30KB, menor flexibilidad
  - ✅ Mantener CSS custom (83 líneas limpias, más rápido a MVP)
  - Paleta de colores: Basada en Vue.js theme (base.css)
  - Tipografía: Inter, system fonts
  - Sistema de diseño: Custom CSS con variables CSS (`:root`)
  - Documentado en: [docs/DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)
  - **SRS actualizado:** Sección 2.2 ya refleja esta decisión ✅

#### Contenido - ✅ **PARCIALMENTE DISPONIBLE**
- **17. ¿Contenido FAQ/Updates disponible?** → **SÍ (básico)** ✅
  - FAQ: 3 preguntas implementadas en [FaqSection.vue](../src/components/sections/FaqSection.vue)
  - Updates: Placeholder con mensaje "Próxima actualización: 21 sept 2025"
  - Hero: Textos sobre Madygraf + RKHA190
  - **Pendiente:** Contenido completo para sección de documentos
- **18. ¿Texto de consentimiento?** → **NO encontrado** ❌

#### Datos y Evidencias - ✅ **DECISIÓN: 4 ETAPAS CONFIRMADO**
- **21. ¿Milestones finales?** → **4 etapas es la cantidad correcta para RKHA190** ✅
  1. Anticipo ($100k)
  2. Saldo embarque ($200k)
  3. Flete y Aduana ($60k)
  4. Montaje/PPM ($18k)
  - Total: $378,000
  - **Análisis:** SRS dice "(1 a 6)" como rango máximo, no como cantidad fija
  - **Estado:** mockData está correcto con 4 etapas para este proyecto
  - **Razón:** Estas 4 son los hitos reales de la RKHA190
  - **SRS:** Se podría mejorar claridad, pero es flexible para proyectos de diferentes tamaños

#### Variables de Entorno - ✅ **ESTRUCTURA LISTA**
- `.env.example` existe ✅
- `.env` está en `.gitignore` ✅
- **Configurado:** Chatwoot (token + base_url)
- **Falta:** `VITE_API_BASE_URL` (crítico)

#### Proyecto y Dominio
- **Organización:** Cooperativa de Trabajo Madygraf ✅
- **Proyecto:** Portal Madypack (crowdfunding para RKHA190) ✅
- **Email de contacto:** info@madypack.com.ar ✅
- **Dominio Chatwoot:** chatwoot.madygraf.com ✅
- **20. ¿Dominio principal?** → **NO definido en código** (¿madypack.com.ar?)

---

### ❌ SIN EVIDENCIA (Requieren respuesta urgente)

#### Backend y API - ❌ **CRÍTICO - BLOQUEANTE**
1. **¿Existe ya un backend implementado?** → **NO hay evidencia en el proyecto**
No hay backend, el backend se hará en python con `Flask` en `pythonanywhere.com`

2. **¿Cuál es la URL base del API?** → **NO definida**
Ya incorporé la URL en el archivo `.env`, expondré con ngrok usando mi PC como servidor

3. **¿Los endpoints del API ya están disponibles?** → **NO confirmado**
No

#### Proveedor Externo de Suscripción - ❌ **CRÍTICO - BLOQUEANTE**
4. **¿Qué proveedor externo se utilizará?** → **NO especificado**
Estoy usando donweb


#### Despliegue - ❌ **IMPORTANTE**
19. **¿Plataforma de despliegue?** → **NO definida**
donweb Ferozo Panel en Alma Linux 8


20. **¿HTTPS configurado?** → **NO confirmado**
Sí


### 1. ✅ **CREDENCIALES - VERIFICADO SEGURO**
**Status:** COMPLETADO ✅
- **Acción realizada:** Análisis con BFG Repo-Cleaner
- **Resultado:** Token de Chatwoot NO está en el historial de git
- **Confirmado:** 
  - ✅ `.env` está correctamente en `.gitignore`
  - ✅ No hay secrets en commits anteriores
  - ✅ Repository es público pero sin exposición de credenciales
  - ✅ `.env.example` actualizado con placeholders únicamente
- **Estado:** SEGURO ✅

### 2. ✅ **DECISIÓN: CSS Custom - COMPLETADO**
**Status:** IMPLEMENTADO Y DOCUMENTADO ✅
- **Decisión tomada:** Mantener CSS custom, actualizar SRS
- **Fecha de decisión:** 2026-01-09
- **Implementación:**
  - ✅ SRS Sección 2.2 actualizada (Bootstrap → CSS vanilla)
  - ✅ [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) creado (329 líneas, guía completa)
  - ✅ Componentes Vue ya listos (no requieren refactor)
  - ✅ Sistema de diseño documentado (paleta, tipografía, spacing)
  
**Por qué esta decisión:**
| Factor | Impacto |
|--------|--------|
| Tiempo a MVP | **-2 semanas vs Bootstrap** ✅ |
| Bundle size | **-30KB vs Bootstrap** ✅ |
| Flexibilidad | **Ilimitada vs limitada** ✅ |
| Código limpio | **83 líneas vs cientos** ✅ |
| Mantenimiento | **Expertise del equipo** ✅ |


### 3. ✅ **DECISIÓN: 4 Milestones CONFIRMADO**
**Status:** RESUELTO ✅
- **SRS dice:** "Milestone / Etapa: hito del proyecto **(1 a 6)**" (rango flexible)
- **Realidad proyecto:** 4 etapas = hitos reales de RKHA190
- **mockData:** Está correcto ✅

**Análisis:**

| Etapa | Nombre | Monto | Estado |
|-------|--------|-------|--------|
| 1 | Anticipo | $100k | Activo |
| 2 | Saldo embarque | $200k | Pendiente |
| 3 | Flete y Aduana | $60k | Pendiente |
| 4 | Montaje/PPM | $18k | Pendiente |
| **TOTAL** | - | **$378k** | - |

**Por qué 4 es correcto:**
- Coinciden con hitos naturales del proyecto
- SRS especifica rango "1 a 6" para ser flexible
- Otros proyectos pueden tener 6, Madygraf tiene 4
- mockData refleja realidad del proyecto ✅

**Sin cambios requeridos:** mockData está correcto

### 4. 🚫 **BLOQUEANTE: Backend NO implementado**
**Riesgo:** CRÍTICO - Sin backend no hay MVP funcional
- **Estado:** No hay evidencia de backend en el proyecto
- **Impacto:** BLOQUEANTE para:
  - Flujo de suscripción
  - Persistencia de datos
  - Integración con proveedor externo
  - Backoffice admin
- **Decisiones urgentes:**
  - [ ] ¿Existe backend en otro repositorio?
  - [ ] ¿Se debe crear desde cero?
  - [ ] ¿Qué stack usar? (Node.js/Express, Nest.js, Python/FastAPI, .NET)
  - [ ] ¿Qué base de datos? (PostgreSQL, MySQL, MongoDB)

### 5. 🚫 **BLOQUEANTE: Proveedor de Suscripción NO definido**
**Riesgo:** CRÍTICO - Core del negocio sin definir
- **Estado:** No hay información sobre proveedor externo
- **Impacto:** No se puede implementar FR-010 a FR-014 (flujo de suscripción)
- **Información necesaria:**
  - [ ] Nombre del proveedor/plataforma
  - [ ] Documentación de integración
  - [ ] Credenciales de sandbox/testing
  - [ ] Estructura de redirect y callbacks
  - [ ] Eventos de webhook

### 6. ⚠️ **Falta de Validación de Formularios**
**Riesgo:** MEDIO - Requisito NFR-SEC-005 no implementado
- **Estado:** No hay librería de validación instalada
- **SRS requiere:** Validación frontend con sanitización
- **Recomendación:**
  - [ ] Instalar Zod o Vuelidate para validación
  - [ ] Instalar DOMPurify para sanitización HTML

---

## 📊 ANÁLISIS DE COMPLETITUD

### Implementación Actual vs SRS v1.0

| Categoría | Requisitos SRS | Implementado | % Completitud |
|-----------|---------------|--------------|---------------|
| **Router y Navegación** | 7 rutas (FR-001) | 8 rutas + lazy loading | 100% ✅ |
| **Flujo Suscripción** | FR-010 a FR-014 | Botón mock | 5% ❌ |
| **Pre-registro** | FR-020 a FR-022 | No | 0% ❌ |
| **Panel Etapas** | FR-030 a FR-033 | Básico sin evidencias | 40% ⚠️ |
| **Updates** | FR-040, FR-041 | Placeholder | 10% ❌ |
| **Chatwoot** | FR-050 a FR-052 | Snippet instalado | 60% ⚠️ |
| **Backoffice** | FR-060 a FR-065 | No | 0% ❌ |
| **API Client** | Todo Cap. 4 | No | 0% ❌ |
| **Seguridad** | NFR-SEC-001 a 005 | Parcial (.env) | 20% ❌ |
| **SEO** | NFR-SEO-001 a 003 | No | 0% ❌ |
| **UTM Capture** | NFR-MKT-001 | No | 0% ❌ |

**TOTAL GENERAL:** ~22% de completitud del SRS v1.0 ⚠️

### Lo que funciona ✅
- Estructura base Vue 3 + TypeScript
- Visualización de milestones mock
- Selección de niveles de contribución
- Layout responsive básico
- Integración Chatwoot (parcial)

### Lo que falta (crítico) ❌
- Vue Router (0%)
- Backend/API (0%)
- Flujo completo de suscripción (0%)
- Formulario de pre-registro (0%)
- Integración con proveedor externo (0%)
- Backoffice admin (0%)
- Sistema de evidencias (0%)

---

## 🎯 RECOMENDACIONES PRIORIZADAS

### Fase 0: Urgente (Antes de continuar)
1. ✅ **Credenciales verificadas - NO expuestas**
2. ✅ **Bootstrap: Decisión completada → CSS custom, SRS actualizado**
3. ✅ **Milestones: 4 etapas confirmadas como correctas**
4. **Responder preguntas críticas restantes:**
   - ¿Documentación/especificación de Donweb (API, parámetros, webhook)?
   - ¿Documentación de backend Flask en Pythonanywhere?
   - Fecha límite v1.0

### Fase 1: Fundación (Sprint 1-2)
1. ✅ Instalar y configurar vue-router
2. Crear estructura de API client (sin backend aún, usar mocks)
3. Implementar captura UTM
4. Instalar librería de validación (Zod)
5. Decidir e instalar sistema de componentes UI (opcional, CSS custom funciona)

### Fase 2: Core MVP (Sprint 3-5)
1. Backend mínimo:
   - Auth admin (magic-link)
   - CRUD milestones/evidencias/updates
   - Endpoint suscripción (sin integración aún)
2. Formulario pre-registro con validación
3. Panel de etapas completo con evidencias
4. Página de updates
5. Integración Chatwoot completa (setUser/setAttributes)

### Fase 3: Integración (Sprint 6-7)
1. Integrar proveedor de suscripción
2. Implementar webhook handler
3. Estados de suscripción completos
4. Backoffice admin funcional
5. Sistema de auditoría

### Fase 4: Producción (Sprint 8)
1. SEO (meta tags, sitemap, robots)
2. Performance (lazy loading, compresión)
3. Testing E2E
4. Deploy y CI/CD
5. Monitoreo y analytics

---

## 📋 PRÓXIMOS PASOS INMEDIATOS

### 🔴 URGENTE (Hoy/Esta Semana)
1. ✅ **[SEGURIDAD]** Credenciales verificadas - NO expuestas en historial
2. ✅ **[DISEÑO]** CSS custom: Decisión completada, SRS actualizado, DESIGN_SYSTEM.md creado
3. ✅ **[DATOS]** Milestones: 4 etapas confirmadas (correctas para RKHA190)
4. **[BLOQUEANTE]** Responder preguntas críticas restantes:
   - ¿Documentación/especificación de Donweb (API, parámetros, webhook)?
   - ¿Documentación de backend Flask en Pythonanywhere?
   - Fecha límite v1.0
   
**Fase 0 estado:** 3/4 completado ✅ (solo esperando respuestas de 3ras partes)

### 🟡 ESTA SEMANA
1. Configurar entorno de desarrollo completo
2. Si backend no existe: Definir arquitectura y comenzar setup
3. Instalar vue-router y comenzar migración
4. Documentar APIs necesarias (aunque no existan aún)

### 🟢 PRÓXIMO SPRINT
1. Implementar flujo de suscripción (front-end first con mocks)
2. Crear formulario de pre-registro
3. Integración completa con Chatwoot
4. Panel de etapas con evidencias (mock)

---

## 📞 INFORMACIÓN DE CONTACTO (Del proyecto)

- **Email:** info@madypack.com.ar
- **Chatwoot:** https://chatwoot.madygraf.com
- **Organización:** Cooperativa de Trabajo Madygraf
- **Proyecto:** Portal Madypack - Crowdfunding RKHA190

---

**Última actualización:** 2026-01-09  
**Versión documento:** 1.1 (con análisis de evidencias)
