# TODO

## Alto nivel (certezas)
- [>] (AL-06) [P0] Ejecutar migracion frontend a sesion por cookies (`httpOnly + CSRF`) por etapas — recomendación final: activar migracion incremental con `authMode` y cutover controlado por entorno.

## Bajo nivel (certezas)
- [ ] (BL-13) [P1] Activar `VITE_AUTH_MODE=cookie` en entornos objetivo y validar flujos E2E (login, refresh, logout, recarga) — recomendación final: cutover progresivo por entorno con rollback a `session` como contingencia.

## Notas
- Soporte de auditoría y opciones: `docs/clean-architecture.audit.md`.
- Dudas estratégicas abiertas: `docs/decisions.open.md`.
- Decisión cerrada DQ-02: `docs/decision.auth-cookie.md`.
