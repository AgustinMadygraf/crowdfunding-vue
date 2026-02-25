# TODO Seguridad y CI/CD

## Convencion de estados
- `[x]` finalizada
- `[>]` en proceso
- `[ ]` pendiente

## Backlog activo (priorizado)

### P0 - Critico
- [ ] [P0][High][todo] Migrar deploy de `ftp://` a `sftp://` o FTPS en `.github/workflows/deploy.yml`.
DoD: no existe `FTP_CONNECT_URL=ftp://`; no existe `set ftp:ssl-allow no`; deploy de prueba exitoso con canal cifrado.

- [>] [P0][High][todo] Definir `environment: production` en GitHub Actions con proteccion (required reviewers / manual gate).
DoD: job de deploy usa `environment: production` y el repositorio aplica reglas de aprobacion para ese environment.

### P1 - Alto
- [>] [P1][High][todo] Endurecer CSP en `public/.htaccess` eliminando `'unsafe-inline'` en `script-src` y `style-src`.
DoD: CSP activa sin `'unsafe-inline'`; scripts inline migrados a archivo o nonce/hash; aplicacion funcional en smoke test.

- [x] [P1][Medium][todo] Remover origenes de desarrollo de CSP de produccion (`http://localhost:*`, `http://127.0.0.1:*`).
DoD: CSP de produccion no incluye hosts locales; validacion manual de flujos criticos OK.

- [>] [P1][Medium][todo] Eliminar logs potencialmente sensibles en runtime productivo (cliente API y servicios).
DoD: no hay `console.log` de requests/payloads fuera de `DEV`; se mantiene trazabilidad via logger con redaccion.

### P2 - Medio
- [ ] [P2][Medium][todo] Definir y documentar politica de almacenamiento de token de auth en frontend.
DoD: decision documentada (memory/session/cookie), implementada de forma consistente y con pruebas basicas de sesion.

- [x] [P2][Low][todo] Automatizar escaneo de seguridad en CI (`npm audit --audit-level=high` + deteccion de secretos).
DoD: workflow dedicado falla en vulnerabilidades altas/criticas o deteccion de secreto; resultado visible en PR.

- [ ] [P2][Low][todo] Reescribir bloque heredoc de `.htaccess` para evitar advertencias del parser YAML local.
DoD: workflow sin advertencias de parser relacionadas al bloque heredoc.

## Backlog Arquitectura Limpia (auditoria 2026-02-25)

### P0 - Critico
- [ ] [P0][High][todo] Aislar `src/application` de `@/infrastructure` y de imports directos de `vue`.
DoD: no existen imports desde `src/application` a `@/infrastructure`; los casos de uso/servicios de aplicacion no importan `vue`; la composicion de dependencias queda en `main.ts` o un composition root dedicado.

- [ ] [P0][High][todo] Desacoplar `src/application/errors/toAppError.ts` de errores concretos de infraestructura.
DoD: `toAppError` usa un contrato de error comun (ej. interface/error code compartido) sin importar clases de `src/infrastructure/repositories/*`.

### P1 - Alto
- [ ] [P1][High][todo] Evitar acceso directo de vistas a repositorios/DTS de infraestructura.
DoD: `src/views/AdminView.vue` y `src/views/DocumentsView.vue` consumen casos de uso o adapters de aplicacion; no importan `@/infrastructure/repositories/*` ni `@/infrastructure/dto`.

- [ ] [P1][High][todo] Consolidar en un solo stack HTTP y retirar implementaciones paralelas.
DoD: queda una sola via activa para requests (sin coexistencia entre `src/infrastructure/api.ts` y `src/infrastructure/http/*`); `ContributionsRepository.refactored.ts` deja de estar como variante aislada (se integra o se elimina).

- [ ] [P1][Medium][todo] Centralizar inyeccion de dependencias para auth y repositorios.
DoD: `router` y `stores` no dependen de singletons concretos de infraestructura; consumen contratos inyectados desde composition root.

- [ ] [P1][Medium][todo] Reubicar `content` fuera de infraestructura para evitar dependencia inversa desde UI.
DoD: componentes/vistas no importan `@/infrastructure/content`; contenido estatico queda en un modulo de presentacion/configuracion.

- [ ] [P1][Low][todo] Eliminar codigo muerto de vistas legacy duplicadas.
DoD: se eliminan `src/views/App.vue`, `src/views/HeroSection.vue`, `src/views/MilestonesSection.vue`, `src/views/ContributionSection.vue`, `src/views/FaqSection.vue`, `src/views/UpdatesSection.vue` si no tienen referencias en build.

### P2 - Medio
- [ ] [P2][Medium][todo] Agregar reglas automaticas de fronteras de arquitectura en CI.
DoD: existe chequeo automatizado (eslint boundaries o dependency-cruiser) que falla si `domain/application` dependen de `infrastructure` o de frameworks UI.

- [ ] [P2][Medium][todo] Aumentar cobertura de pruebas en capas internas.
DoD: casos de uso de `src/application/usecases/*` y adaptadores clave de infraestructura tienen pruebas unitarias; el pipeline ejecuta esas pruebas en CI.

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
