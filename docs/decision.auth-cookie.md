# Decision de arquitectura: autenticacion basada en cookies

- ID: DQ-02
- Fecha de decision: 2026-03-03
- Estado: Aprobada

## Decision
Adoptar como estrategia objetivo `cookies HttpOnly + Secure + SameSite` con proteccion CSRF, reemplazando JWT persistido en `sessionStorage` como mecanismo principal de sesion.

## Contexto
- El frontend tenia una implementacion centrada en JWT en `sessionStorage`.
- Tambien existia infraestructura parcial para cookies/CSRF (`credentials: 'include'`, `csrfService`).
- Se prioriza reducir superficie ante XSS y simplificar manejo de token en cliente.

## Alcance
- Frontend web (`crowdfunding-vue`).
- Endpoints de auth y endpoints protegidos de contribuciones.

## Consecuencias esperadas
- Pros:
  - Menor exposicion del token en cliente.
  - Modelo de sesion mas robusto para navegador.
- Contras:
  - Requiere contrato backend claro (seteo/refresh/invalidacion de cookies, endpoint `me`).
  - Migracion por etapas para no cortar flujos actuales.

## Plan de implementacion por etapas
1. Etapa 1 (frontend no disruptivo):
   - Introducir `authMode` configurable (`session` / `cookie`).
   - Asegurar `credentials: 'include'` en login/refresh y requests protegidos.
2. Etapa 2 (contrato backend):
  - Definir cookie flags (`HttpOnly`, `Secure`, `SameSite`) y renovacion.
  - Exponer endpoint de sesion actual (`GET /api/auth/me`) con contrato canonico `{ "user": { ... } }`.
3. Etapa 3 (cutover):
   - Cambiar modo por defecto a `cookie` en entornos objetivo.
   - Retirar persistencia JWT en cliente donde aplique.
4. Etapa 4 (limpieza):
   - Eliminar codigo legado de modo `session` si ya no es necesario.

## Riesgos
- Si backend no expone `me`/refresh coherente con cookies, se degrada rehidratacion de sesion al recargar.
- Configuracion CORS/SameSite incorrecta puede romper login en produccion.
