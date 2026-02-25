# TODO completado

## Convencion de estados
- `[x]` finalizada
- `[>]` en proceso
- `[ ]` pendiente

## Completadas (Backlog activo original)

### Seguridad y CI/CD
- [x] [P1][Medium][todo] Remover origenes de desarrollo de CSP de produccion (`http://localhost:*`, `http://127.0.0.1:*`).
DoD: CSP de produccion no incluye hosts locales; validacion manual de flujos criticos OK.

- [x] [P2][Low][todo] Automatizar escaneo de seguridad en CI (`npm audit --audit-level=high` + deteccion de secretos).
DoD: workflow dedicado falla en vulnerabilidades altas/criticas o deteccion de secreto; resultado visible en PR.

- [x] [P2][Low][todo] Reescribir bloque heredoc de `.htaccess` para evitar advertencias del parser YAML local.
DoD: workflow sin advertencias de parser relacionadas al bloque heredoc.

### Arquitectura Limpia (auditoria 2026-02-25)
- [x] [P0][High][todo] Aislar `src/application` de `@/infrastructure` y de imports directos de `vue`.
DoD: no existen imports desde `src/application` a `@/infrastructure`; los casos de uso/servicios de aplicacion no importan `vue`; la composicion de dependencias queda en `main.ts` o un composition root dedicado.

- [x] [P0][High][todo] Desacoplar `src/application/errors/toAppError.ts` de errores concretos de infraestructura.
DoD: `toAppError` usa un contrato de error comun (ej. interface/error code compartido) sin importar clases de `src/infrastructure/repositories/*`.

- [x] [P1][High][todo] Evitar acceso directo de vistas a repositorios/DTS de infraestructura.
DoD: `src/views/AdminView.vue` y `src/views/DocumentsView.vue` consumen casos de uso o adapters de aplicacion; no importan `@/infrastructure/repositories/*` ni `@/infrastructure/dto`.

- [x] [P1][High][todo] Consolidar en un solo stack HTTP y retirar implementaciones paralelas.
DoD: queda una sola via activa para requests (sin coexistencia entre `src/infrastructure/api.ts` y `src/infrastructure/http/*`); `ContributionsRepository.refactored.ts` deja de estar como variante aislada (se integra o se elimina).

- [x] [P1][Medium][todo] Reubicar `content` fuera de infraestructura para evitar dependencia inversa desde UI.
DoD: componentes/vistas no importan `@/infrastructure/content`; contenido estatico queda en un modulo de presentacion/configuracion.

- [x] [P1][Low][todo] Eliminar codigo muerto de vistas legacy duplicadas.
DoD: se eliminan `src/views/App.vue`, `src/views/HeroSection.vue`, `src/views/MilestonesSection.vue`, `src/views/ContributionSection.vue`, `src/views/FaqSection.vue`, `src/views/UpdatesSection.vue` si no tienen referencias en build.

- [x] [P2][Medium][todo] Agregar reglas automaticas de fronteras de arquitectura en CI.
DoD: existe chequeo automatizado (eslint boundaries o dependency-cruiser) que falla si `domain/application` dependen de `infrastructure` o de frameworks UI.

## Hecho (historico)
- [x] Hacer fail-fast real en deploy lftp (`set cmd:fail-exit true` y remover `|| echo` en `mirror`).
- [x] Validar `dist/index.html` y tamano minimo antes de publicar.
- [x] Versionar `.htaccess` en `public/.htaccess` y eliminar generacion inline en workflow.
- [x] Agregar `deploy-smoke` opcional con URL explicita (`DEPLOY_HEALTHCHECK_URL`).
- [x] Crear `build-validate` para validar solo variables de build.
- [x] Separar pipeline en jobs de build y deploy, conectados por artifact inmutable.
- [x] Crear `build-typecheck` como job dedicado.
- [x] Crear `build-test` como job dedicado.
- [x] Crear `build-package` para generar `dist/` y subir artifact.
- [x] Evitar doble type-check en empaquetado (usar `npm run build-only` donde corresponda).
- [x] Crear `deploy-preflight` para validar vars/secrets FTP, resolver IPv4 y chequear puerto.
- [x] Crear `deploy-release` que consuma artifact y haga deploy.
- [x] Pinnear actions por SHA para reducir riesgo de supply chain.
