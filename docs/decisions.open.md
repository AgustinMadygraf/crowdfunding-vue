# Decisiones y preguntas abiertas (alto nivel)

## (DQ-02) Evolución de estrategia de autenticación/token en frontend
- Estado: Abierta
- Contexto:
  - Existe implementación con `sessionStorage` y refresh token.
  - También hay servicios CSRF y flujos `credentials: 'include'` que sugieren transición parcial a cookies.
- Preguntas:
  - ¿El objetivo definitivo es JWT en `sessionStorage` o cookies `httpOnly` + CSRF?
  - ¿Qué timeline hay para backend y migración del frontend?
- Opciones:
  1) Mantener `sessionStorage` como estrategia estable.
     - Pros: simple, sin dependencia de cambios backend.
     - Contras: superficie XSS mayor que cookie `httpOnly`.
  2) Migrar a cookies `httpOnly` + CSRF como estrategia final.
     - Pros: mejor postura de seguridad del token.
     - Contras: requiere coordinación backend, cambios de flujo y pruebas E2E.
  3) Híbrido temporal con feature flag.
     - Pros: transición gradual.
     - Contras: complejidad operativa duplicada.
- Información faltante / cómo decidir:
  - Capacidades backend actuales y fecha objetivo.
  - Requisitos de seguridad/compliance del producto.
- Impacto / riesgos:
  - Decisión tardía puede forzar refactors repetidos en auth/repositorios.

## (DQ-03) Gobernanza del contenido estático (hardcodeado vs backend/CMS)
- Estado: Abierta
- Contexto:
  - El contenido de UI vive en `src/presentation/content.ts` con tipado extenso.
  - No está claro si este contenido debe ser editable sin redeploy.
- Preguntas:
  - ¿El contenido debe permanecer en código o migrar a API/CMS?
  - ¿Qué partes requieren versionado editorial dinámico?
- Opciones:
  1) Mantener hardcodeado en frontend.
     - Pros: simple y rápido.
     - Contras: cualquier cambio editorial requiere despliegue.
  2) Migrar a backend/CMS para textos dinámicos.
     - Pros: mayor autonomía de negocio y localización.
     - Contras: más infraestructura y validaciones de contrato.
  3) Mixto: contenido crítico en código, copy de negocio en backend.
     - Pros: balance entre control técnico y flexibilidad.
     - Contras: reglas de ownership más complejas.
- Información faltante / cómo decidir:
  - Frecuencia esperada de cambios editoriales.
  - Quién administra contenido (equipo técnico vs marketing/operaciones).
- Impacto / riesgos:
  - Sin definición, el dominio puede seguir contaminado con concerns de presentación.

## (DQ-04) Flujo definitivo de pagos MercadoPago
- Estado: Abierta
- Contexto:
  - Hay integración de SDK (`src/infrastructure/mercadopagoService.ts`) y también redirección directa en `SubscribePaymentView`.
  - El flujo actual mezcla inicialización SDK y navegación por token.
- Preguntas:
  - ¿El checkout debe abrirse via SDK frontend o siempre por URL de preferencia generada backend?
  - ¿Qué fuente de verdad define estado de pago y reintentos?
- Opciones:
  1) Checkout frontend con SDK.
     - Pros: UX más integrada.
     - Contras: más complejidad en cliente y fallbacks.
  2) Redirección/checkout gestionado por backend.
     - Pros: cliente más simple, menor acoplamiento con proveedor.
     - Contras: menor control fino de UX frontend.
  3) Híbrido con fallback.
     - Pros: resiliencia ante fallos.
     - Contras: dobles caminos para mantener y testear.
- Información faltante / cómo decidir:
  - Requerimientos de negocio UX y constraints de compliance.
  - Contrato backend definitivo para `preference_id` y estados.
- Impacto / riesgos:
  - Mantener estrategias mixtas incrementa errores de flujo de pago.
