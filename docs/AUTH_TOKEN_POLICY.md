# Politica de Token Auth (Frontend)

## Decision vigente
- `sessionStorage` para `auth_token` y `auth_user` en frontend.
- No usar `localStorage` para token de autenticacion.
- Mantener cabeceras de autenticacion con `Bearer` solo cuando exista token en sesion.

## Justificacion
- Reduce persistencia del token respecto de `localStorage`.
- Permite implementar la politica actual sin cambios disruptivos en backend.
- Mantiene separacion por capas: contrato en `SessionStoragePort` + implementacion en infraestructura + composicion en factory.

## Implementacion actual
- Composicion por defecto en factory:
  - `src/infrastructure/services/authServiceFactory.ts`
- Fallback interno del servicio:
  - `src/infrastructure/services/authService.ts`
- Implementacion concreta:
  - `src/infrastructure/services/auth/tokenStorage.ts` (`SessionStorageTokenStorage`)

## Guardrails de seguridad (actuales)
- Evitar logs de payload/token en produccion.
- CSP endurecida progresivamente.
- CSRF token para operaciones mutables donde aplica.

## Roadmap destino final
Objetivo: migrar a cookies `HttpOnly` + `Secure` + `SameSite` con CSRF robusto.

Fases:
1. Backend emite refresh/session cookie `HttpOnly` y endpoint de refresh seguro.
2. Frontend reduce dependencia de token persistido; access token en memoria (opcional) o sesion gestionada por cookie.
3. Endurecer CSRF y validar CORS/credenciales por entorno.
4. Eliminar almacenamiento de token en `sessionStorage` cuando el backend complete la migracion.
