# Flujo de Autenticación (Frontend)

## Estado
- Store: `src/stores/authStore.ts` (Pinia)
- Fuente de verdad: `AuthService` (persiste en localStorage)
- Campos: `user`, `token`, `isAuthenticated`, `isLoading`, `error`

## Composición
- `hydrateFromService()`: sincroniza store desde AuthService/storage (usar al montar vistas/críticos)
- `loginWithGoogle(token)`: llama a AuthService, actualiza store; lanza error si falla
- `logout()`: delega en AuthService y resync
- `getAuthHeaders`: computed que expone headers con token

## Router Guard
- Archivo: `src/router/index.ts`
- Comportamiento: si `meta.requiresAuth` y no hay sesión → redirige a `subscribe` con `?redirect=<fullPath>`
- También setea `document.title` si viene en `meta`

## Componentes conectados
- `SubscribeView.vue`: usa store para estado de auth y elimina reload tras login
- `GoogleAuthButton.vue`: login/logout via store, sincroniza al montar con `hydrateFromService`
- `App.vue`: navegación reactiva según `isAuthenticated`

## Buenas prácticas
- Invocar `hydrateFromService()` en entry points críticos (e.g., guard, vistas que necesitan sesión)
- No escribir directamente en el store sobre `user`/`token`; usar acciones (login/logout/hydrate)
- Para llamadas a API, preferir `authStore.getAuthHeaders`

## Pendiente backend (defensa en profundidad)
- Validar/sanitizar avatar URLs y orígenes permitidos
- Tokens en cookies HttpOnly/SameSite si el backend lo soporta
