# TODO Seguridad y CI/CD

## Convencion de estados
- `[x]` finalizada
- `[>]` en proceso
- `[ ]` pendiente

## Backlog activo (priorizado)

### P0 - Critico
- [>] [P0][High][todo] Migrar deploy de `ftp://` a `sftp://` o FTPS en `.github/workflows/deploy.yml`.
DoD: no existe `FTP_CONNECT_URL=ftp://`; no existe `set ftp:ssl-allow no`; deploy de prueba exitoso con canal cifrado.

- [>] [P0][High][todo] Definir `environment: production` en GitHub Actions con proteccion (required reviewers / manual gate).
DoD: job de deploy usa `environment: production` y el repositorio aplica reglas de aprobacion para ese environment.

### P1 - Alto
- [>] [P1][High][todo] Sustituir `console.*` por logger centralizado con redaccion de datos sensibles en capas `infrastructure`, `presentation` y `views`.
DoD: no hay `console.log/debug/info/warn/error` directos en codigo productivo; existe logger unico con niveles por entorno y redaccion de tokens/headers/payloads sensibles.

- [x] [P1][High][todo] Reducir `any` en paths criticos de auth/pagos/chat (`GoogleAuthButton`, `mercadopagoService`, `useChatwoot`, `chatwootClientService`).
DoD: no quedan `any` en esos modulos; se reemplazan por tipos explicitos, `unknown` + type guards o interfaces DTO.

- [x] [P1][High][todo] Convertir ejemplos de autenticacion no ejecutables en pruebas reales o removerlos (`src/infrastructure/services/authService.examples.ts`).
DoD: no quedan bloques `describe/it` fuera de `*.spec.ts`; los escenarios utiles viven en tests ejecutados por Vitest.

- [ ] [P1][Medium][todo] Endurecer TypeScript para evitar regresiones de tipado (`no-explicit-any` y `no-unsafe-*` de ESLint con rollout incremental).
DoD: reglas activas en CI con baseline controlada; PR nuevo con `any` o accesos inseguros falla.

- [>] [P1][Medium][todo] Ampliar testing automatizado de integraciones criticas del frontend (auth, pagos, sanitizacion URL/UTM, CSRF composable).
DoD: existen pruebas unitarias/integracion para esos flujos; `npm run test -- --run` ejecuta tests reales y deja de fallar por "No test files found".
