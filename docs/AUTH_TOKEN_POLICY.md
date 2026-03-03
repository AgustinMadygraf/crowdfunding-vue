# Politica de Token/Auth (Frontend)

## Decision vigente (2026-03-03)
- Estrategia objetivo: sesion por `cookies HttpOnly + Secure + SameSite` con CSRF.
- Estrategia transicional: dual mode configurable por entorno con `VITE_AUTH_MODE`:
  - `session` (compatibilidad)
  - `cookie` (objetivo)

Referencia de decision: `docs/decision.auth-cookie.md`.

## Estado de implementacion actual
- Se introdujo `authMode` en configuracion de app (`session` por defecto).
- `AuthServiceFactory` selecciona storage segun modo:
  - `session` -> `SessionStorageTokenStorage`
  - `cookie` -> `MemoryOnlyTokenStorage`
- Requests de auth y contribuciones enviando `credentials: 'include'`.

## Contrato backend esperado para modo `cookie`
1. Login
- `POST /api/auth/google` debe setear cookie(s) de sesion/refresh con flags seguras.
- Debe devolver al menos datos de usuario necesarios para el frontend.

2. Sesion actual
- `GET /api/auth/me` (o equivalente) para rehidratar sesion tras reload sin depender de JWT en storage.

3. Refresh
- `POST /api/auth/refresh` debe renovar cookie(s) de sesion de forma segura.

4. Logout
- Endpoint que invalide sesion y expire cookies en servidor/cliente.

5. Seguridad web
- CORS habilitado con credenciales para origenes permitidos.
- CSRF obligatorio en operaciones mutables.
- Cookie flags recomendadas: `HttpOnly`, `Secure`, `SameSite=Lax` o `Strict` segun flujo.

## Criterio de cutover a cookie por defecto
- Backend expone `auth/me` estable en produccion.
- Login/refresh/logout funcionan via cookies en E2E.
- Flujos protegidos (`/account`, contribuciones) validados con recarga de pagina.
- Luego cambiar `VITE_AUTH_MODE=cookie` en entornos objetivo.

