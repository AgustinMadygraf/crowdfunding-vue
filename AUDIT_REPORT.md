# 🔍 REPORTE DE AUDITORÍA SENIOR
## Crowdfunding Vue - Seguridad & Calidad de Código

**Fecha:** 11 de enero de 2026  
**Auditor:** Senior Security & Architecture Review  
**Alcance:** Frontend Vue 3 + TypeScript  
**Stack:** Vite, Pinia, Router, Google OAuth, MercadoPago  

---

## A) CERTEZAS (Evidencia Directa)

### ✅ Fortalezas Confirmadas

| Aspecto | Evidencia | Estado |
|---------|-----------|--------|
| **Protección XSS (Avatares)** | `urlSanitizer.ts` con whitelist de dominios + validación de protocolos | ✅ IMPLEMENTADO |
| **HTTPS requerido en PROD** | `authService.ts:69-72` valida HTTPS en producción | ✅ IMPLEMENTADO |
| **CSP Headers** | `vite.config.ts` define CSP exhaustivo (img-src, script-src, connect-src, etc.) | ✅ IMPLEMENTADO |
| **Rate limiting auth** | `authService.ts:35-38` limita intentos login (5 en 60s) | ✅ IMPLEMENTADO |
| **JWT expiration check** | `authService.ts:110-139` decodifica y valida `exp` claim | ✅ IMPLEMENTADO |
| **Timeout en requests** | `api.ts:90` AbortController con DEFAULT_TIMEOUT_MS | ✅ IMPLEMENTADO |
| **Centralización API base URL** | `config/api.ts` + `getApiBaseUrl()` en todos repos | ✅ IMPLEMENTADO |
| **Separación de capas** | Repos → Services → Stores → Components (Clean Arch) | ✅ IMPLEMENTADO |
| **Type safety TypeScript** | Strict mode, DTOs tipados, interfaces IAuthService | ✅ IMPLEMENTADO |
| **Error handling estructurado** | ApiException, RepositoryError custom classes | ✅ IMPLEMENTADO |

### ⚠️ Debilidades Confirmadas

| Aspecto | Severidad | Evidencia |
|---------|-----------|-----------|
| **CSP muy permisivo** | MEDIA | `vite.config.ts` permite `'unsafe-inline'` + `'unsafe-eval'` en scripts |
| **Secrets en env vars sin .env.example** | MEDIA | VITE_MERCADOPAGO_PUBLIC_KEY, VITE_GOOGLE_CLIENT_ID sin referencia |
| **No hay validación en inputs (forms)** | MEDIA | SubscribeView.vue no valida emails, montos antes de enviar |
| **Logging sensible en PROD** | MEDIA | `authService.ts:64` loguea Client ID aún en DEV (pero está protegido) |
| **Fetch sin reintentos** | BAJA | Una falla = error inmediato (no hay retry logic) |
| **CORS sin validación origen** | BAJA | Backend permite localhost:5173, pero no hay CORS en frontend |
| **Token en localStorage** | BAJA | localStorage es vulnerable a XSS (pero CSP lo mitiga) |
| **Sin CSRF tokens** | BAJA | POST requests sin token CSRF (depende backend) |
| **Documentación ausente** | MEDIA | Sin README.md, docs/ vacío, sin guías de deploy |
| **Sin tests unitarios/E2E** | MEDIA | 0% test coverage (sin vitest, sin Cypress/Playwright) |

---

## B) DUDAS / RIESGOS POR INFO FALTANTE

### Preguntas que cambian el diagnóstico:

1. **¿Backend implementa CORS correctamente?**
   - ¿Responde OPTIONS preflight en todos endpoints?
   - ¿Valida `Origin` header?
   - ¿Retorna credenciales correctamente?

2. **¿Cómo se manejan secrets en producción?**
   - ¿Hay `.env.production` versionado o en CI/CD?
   - ¿MercadoPago public key está realmente "pública" o es sensible?
   - ¿Google OAuth client ID está restringido a dominio?

3. **¿Qué servidor hosting se usa?**
   - ¿Nginx/Apache con HSTS, GZIP, caching headers?
   - ¿CDN con versioning de assets?
   - ¿Logs y monitoring activos?

4. **¿Auditoría de backend completada?**
   - ¿Endpoints validan entrada (XSS, SQL injection, RCE)?
   - ¿Hay rate limiting en backend?
   - ¿JWT validation y refresh tokens implementados?
   - ¿DB tiene backups y encryption?

5. **¿Nivel de exposición de datos?**
   - ¿Contribuciones son públicas o privadas?
   - ¿PII (emails, nombres) se loguea en analytics?
   - ¿Payments PCI DSS compliant?

6. **¿Timeline y presupuesto?**
   - ¿Cuándo go-live?
   - ¿Recursos para remediación?

---

## C) HALLAZGOS PRIORIZADOS

### Tabla: Severidad | Impacto | Evidencia | Recomendación | Esfuerzo

#### 🔴 CRÍTICA (Fix inmediato)

| Hallazgo | Sev | Impacto | Evidencia | Recomendación | Esfuerzo |
|----------|-----|---------|-----------|----------------|----------|
| **CSP permite `unsafe-inline` en scripts** | CRÍTICA | Inyección JS + XSS bypass | `vite.config.ts:14` `script-src 'unsafe-inline'` | Remover `unsafe-inline`, usar nonces para estilos inline. Refactorizar estilos a `.css` | 4-6h |
| **Sin validación de input en formularios** | CRÍTICA | XSS, RCE backend, DoS | SubscribeView.vue sin validar emails/montos | Usar Zod/Yup schema validation + sanitización. Ver `subscriptionSchema.ts` | 3-4h |
| **Token JWT sin refresh logic** | ALTA | Sesión hijack tras exp | `authService.ts` valida exp pero no refresh | Implementar refresh token + silent refresh en 5m antes exp | 6-8h |

#### 🟠 ALTA (24-48h)

| Hallazgo | Sev | Impacto | Evidencia | Recomendación | Esfuerzo |
|----------|-----|---------|-----------|----------------|----------|
| **Secrets en código/env públicos** | ALTA | Credentials leak | VITE_MERCADOPAGO_PUBLIC_KEY, VITE_GOOGLE_CLIENT_ID en .env.example | Usar `.env.local` (gitignore), CI/CD secrets, Vault | 2h |
| **Sin CSRF protection** | ALTA | State-changing POST hijack | POST /api/contributions sin token | Sincronizar backend: CSRF token en session + validar en POST | 3h |
| **Logging verbose en producción** | ALTA | Info disclosure | `authService.ts:64` loguea Client ID | Condicionar logs a DEV mode; usar structured logging en PROD | 1-2h |
| **Fetch sin reintentos** | ALTA | Fallos de red = error UX | `DocumentsRepository.ts` falla si timeout | Implementar retry con exponential backoff (3 intentos) | 4-6h |
| **Sin validación en edge cases** | ALTA | Comportamiento inesperado | getByToken sin validar token vacío | Agregar validación `if (!token)` antes fetch | 2h |

#### 🟡 MEDIA (1-2 semanas)

| Hallazgo | Sev | Impacto | Evidencia | Recomendación | Esfuerzo |
|----------|-----|---------|-----------|----------------|----------|
| **Sin test coverage** | MEDIA | Regresiones, bugs en prod | 0 tests (no vitest/Jest) | Setup vitest + escribir tests (>80% coverage) | 20-30h |
| **Falta documentación & runbook** | MEDIA | Onboarding lento, no clarity | Ningún README.md, docs vacío | Crear: README, SETUP.md, SECURITY.md, DEPLOYMENT.md | 8-10h |
| **Error handling inconsistente** | MEDIA | UX pobre, debug difícil | Algunos components sin try-catch | Wrapper utilities globalError handler + toast notifications | 4-6h |
| **Composables anidados profundos** | MEDIA | Performance + readability | useSubscription → contributionsRepository → authService | Refactorizar con provider pattern (context API o Pinia) | 6-8h |
| **Storage vulnerabilities** | MEDIA | XSS = localStorage breach | Token en localStorage sin options | Migrar a sessionStorage + httpOnly cookie (backend change) | 4h frontend, 8h backend |
| **No Environment parity** | MEDIA | "Works on my machine" | Ningún docker/compose para dev | Crear docker-compose + .dockerignore | 3-4h |

#### 🔵 BAJA (nice-to-have)

| Hallazgo | Sev | Impacto | Evidencia | Recomendación | Esfuerzo |
|----------|-----|---------|-----------|----------------|----------|
| **Footer año desactualizado** | BAJA | UX/branding | `AppFooter.vue:27` 2025 → 2026 | Cambiar año automático: `new Date().getFullYear()` | 0.5h |
| **Falta rate limiting frontend** | BAJA | User frustration (spam clicks) | Botón "Completar Pago" sin debounce | Agregar debounce/throttle en handlers críticos | 1h |
| **Logging inconsistente (algunos console.log)** | BAJA | Noise en logs | Mezcla de console.log + structured logs | Unificar a logger service (winston, pino) | 2-3h |
| **Componentes monolíticos** | BAJA | Reusability baja | DocumentsView.vue 300+ líneas | Descomponer en sub-components (DocumentCard, EmptyState, etc) | 3-4h |
| **No performance monitoring** | BAJA | Blind spot en UX | Sin Web Vitals, Sentry | Agregar Sentry + Web Vitals collector | 2-3h |

---

## D) PLAN DE ACCIÓN POR ETAPAS

### 📋 ETAPA 1: Immediate Hotfixes (24-48h) — **GO/NO-GO**

**Bloqueo de producción:**

- [ ] **Remover `unsafe-inline` de CSP** (1h)
  ```typescript
  // ANTES: script-src 'unsafe-inline'
  // DESPUÉS: script-src 'self' (+ nonces si hay estilos inline)
  ```

- [ ] **Agregar input validation (Zod)** (3-4h)
  ```typescript
  // src/application/schemas/contributionSchema.ts
  import { z } from 'zod'
  export const createContributionSchema = z.object({
    email: z.string().email(),
    monto: z.number().min(100).max(1000000),
    nivel_id: z.string().uuid()
  })
  // Usar en SubscribeView.vue antes POST
  ```

- [ ] **Condicionar logs a DEV** (1h)
  ```typescript
  if (import.meta.env.DEV) {
    console.log('[Auth] Client ID:', id)
  }
  ```

- [ ] **Validar token antes fetch** (0.5h)
  ```typescript
  if (!token?.trim()) {
    error.value = 'Token inválido'
    return
  }
  ```

- [ ] **Implementar refresh token logic** (6-8h) — *Requiere backend*
  ```typescript
  // authService.ts
  private async refreshTokenIfNeeded() {
    const payload = this.decodeJWT(this.authState.token!)
    const expiresIn = payload.exp - Math.floor(Date.now() / 1000)
    if (expiresIn < 300) { // < 5 min
      await this.silentRefresh()
    }
  }
  ```

**Validation:** Type-check, manual regression testing, CSP validation

---

### 📋 ETAPA 2: Security Hardening (1-2 semanas)

- [ ] **Agregar retry logic con backoff exponencial** (4-6h)
  ```typescript
  // src/infrastructure/api.ts - AgregAr método retry
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxAttempts = 3
  ): Promise<T> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        return await fn()
      } catch (err) {
        if (i === maxAttempts - 1) throw err
        await new Promise(r => setTimeout(r, 2 ** i * 1000))
      }
    }
  }
  ```

- [ ] **Implementar CSRF tokens** (3h) — *Sincronizar con backend*
  - Backend: Generar token en sesión, validar en POST
  - Frontend: Leer de cookie/header, enviar en X-CSRF-Token

- [ ] **Migrar token a sessionStorage + httpOnly cookie** (4h frontend, 8h backend)
  - Remove localStorage, usar session cookie (backend)
  - Frontend leerá de cookie automáticamente

- [ ] **Configurar environment files** (2h)
  ```bash
  .env.example (versionado)
  .env.local (gitignore)
  .env.production (CI/CD secrets)
  ```

- [ ] **Setup Docker compose para dev** (3-4h)
  ```yaml
  services:
    app:
      build: .
      ports:
        - "5173:5173"
      environment:
        VITE_API_BASE_URL: http://backend:5000
  ```

**Validation:** OWASP Top 10 checklist, security headers validator

---

### 📋 ETAPA 3: Quality & Testing (1-2 semanas)

- [ ] **Setup vitest + coverage** (4-6h)
  ```bash
  npm install -D vitest @vitest/ui happy-dom
  ```
  ```typescript
  // vitest.config.ts
  import { defineConfig } from 'vitest/config'
  export default defineConfig({
    test: {
      environment: 'happy-dom',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        lines: 80
      }
    }
  })
  ```

- [ ] **Escribir tests críticos** (12-16h)
  - Auth flow (login, logout, token refresh)
  - Form validation (SubscribeView)
  - Error handling (DocumentsView retry)
  - API client (timeout, retry, error mapping)

- [ ] **Documentación** (8-10h)
  ```
  README.md (features, setup, deploy)
  SETUP.md (dev environment)
  SECURITY.md (threat model, CSP, auth)
  DEPLOYMENT.md (build, env vars, health checks)
  API.md (endpoints, auth headers)
  ```

- [ ] **Refactorizar componentes monolíticos** (3-4h)
  - Descomponer DocumentsView.vue en:
    - DocumentsSection.vue
    - DocumentCard.vue
    - DocumentsList.vue

- [ ] **Estructura de error handling** (4-6h)
  ```typescript
  // src/infrastructure/errorHandler.ts
  export class GlobalErrorHandler {
    static handle(error: unknown) {
      if (error instanceof ApiException) {
        // Toast + log
      } else if (error instanceof ValidationError) {
        // Form error
      }
    }
  }
  ```

**Validation:** >80% coverage, docs updated, peer review

---

### 📋 ETAPA 4: Production Readiness (2-4 semanas)

- [ ] **Performance monitoring** (2-3h)
  - Web Vitals + Sentry
  - Bundle size analysis
  - Lighthouse audit

- [ ] **Deployment pipeline** (4-6h)
  - GitHub Actions / GitLab CI
  - Auto-deploy main → staging → production
  - Health checks + smoke tests

- [ ] **Security audit checklist** (2-3h)
  - OWASP Top 10
  - SCA (dependabot)
  - Code review with security focus

- [ ] **Load testing** (2-3h)
  - MercadoPago flow
  - DocumentsView load
  - Concurrent logins

**Validation:** Go-live checklist signed off

---

## E) CHECKLIST DE VERIFICACIÓN

### Pre-Launch Security & Quality

#### 🔒 Seguridad

- [ ] CSP headers validados (sin unsafe-inline)
- [ ] HTTPS en producción forzado
- [ ] Secrets en .env.local (no en código)
- [ ] JWT refresh token + silent refresh funcionando
- [ ] CSRF tokens en POST requests
- [ ] Input validation (Zod) en todos forms
- [ ] Rate limiting en login (frontend + backend)
- [ ] XSS protection (urlSanitizer) funcional
- [ ] CORS headers correctos (backend)
- [ ] Logging sin PII/secrets
- [ ] API timeouts + retry logic
- [ ] Error messages sin info sensible
- [ ] Dependencias auditadas (`npm audit`)
- [ ] Stored XSS tests pasados

#### 🏗️ Arquitectura

- [ ] Clean Architecture layers respetadas
- [ ] SOLID principles cumplidos
- [ ] Type safety 100% (`strict: true`)
- [ ] Interfaces explícitas (IAuthService, IRepository)
- [ ] DTOs separados de domain models
- [ ] Error classes custom (ApiException, RepositoryError)
- [ ] Composables sin side effects
- [ ] Store (Pinia) sincronizado con service
- [ ] No circular dependencies
- [ ] Componentes <300 LOC

#### 🧪 Testing

- [ ] >80% code coverage
- [ ] Auth flow tests
- [ ] Form validation tests
- [ ] API error handling tests
- [ ] Router guard tests
- [ ] E2E critical user journeys (si hay presupuesto)

#### 📚 Documentación

- [ ] README.md completo
- [ ] SETUP.md con pasos dev
- [ ] SECURITY.md con threat model
- [ ] DEPLOYMENT.md con checklist
- [ ] Code comments en métodos complejos
- [ ] JSDoc en funciones públicas

#### 📊 Performance

- [ ] Lighthouse score >90
- [ ] Bundle size <200KB (gzipped)
- [ ] First Contentful Paint <2s
- [ ] No console errors/warnings
- [ ] Memory leaks scan
- [ ] Web Vitals monitoreados

#### 🚀 Deployment

- [ ] Docker image buildable
- [ ] Health checks implementados
- [ ] Graceful shutdown
- [ ] .env validation en startup
- [ ] Monitoring + alerts
- [ ] Rollback strategy
- [ ] Secrets rotation policy

---

## 📌 SUMMARY

### Quick Wins (4-6h)
✅ Remover unsafe-inline CSP  
✅ Validar inputs con Zod  
✅ Condicionar logs a DEV  
✅ Footer año automático  

### Critical Path (2-3 semanas)
🔴 JWT refresh token  
🔴 CSRF protection  
🔴 Retry logic  
🔴 Tests + docs  

### Go/No-Go Decision
**NO GO para producción hasta:**
1. CSP hardened (unsafe-inline removido)
2. Input validation implementada
3. JWT refresh funcionando
4. Tests >60% coverage mínimo

---

## 📬 Next Steps

1. **Semana 1:** Hotfixes + CSP hardening
2. **Semana 2:** Security features (CSRF, retry, refresh)
3. **Semana 3:** Tests + docs
4. **Semana 4:** Performance + deployment

---

**Auditoría completada:** 11/01/2026  
**Auditor:** Senior Security & Architecture Review  
**Siguiente review:** Post-fix (3-4 semanas)
