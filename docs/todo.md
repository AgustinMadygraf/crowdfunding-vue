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

- [>] [P1][Medium][todo] Eliminar logs potencialmente sensibles en runtime productivo (cliente API y servicios).
DoD: no hay `console.log` de requests/payloads fuera de `DEV`; se mantiene trazabilidad via logger con redaccion.
## Backlog Arquitectura Limpia (auditoria 2026-02-25)

### P1 - Alto
- [ ] [P1][Medium][todo] Centralizar inyeccion de dependencias para auth y repositorios.
DoD: `router` y `stores` no dependen de singletons concretos de infraestructura; consumen contratos inyectados desde composition root.
