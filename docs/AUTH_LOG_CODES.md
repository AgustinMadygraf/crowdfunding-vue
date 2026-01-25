# Códigos de Logs de Auth

Referencia de códigos de log emitidos por `AuthService`. Útil para diagnosticar fallos sin exponer mensajes largos en consola.

## Configuración y entorno

- `AUTH_API_URL_HTTP` — La API base no usa HTTPS en producción. Acción: ajustar `VITE_API_BASE_URL`.
- `AUTH_CFG_MISSING` — Falta `VITE_GOOGLE_CLIENT_ID` en configuración. Acción: definir `.env`.

## JWT y sesión

- `AUTH_JWT_DECODE_FAIL` — No se pudo decodificar el JWT para validar expiración.
- `AUTH_JWT_EXPIRED` — El token está expirado.
- `AUTH_JWT_NO_EXP` — El JWT no trae claim `exp`.
- `AUTH_SESSION_EXPIRED` — Sesión expiró y se forzó logout.
- `AUTH_LOAD_SESSION_FAIL` — Falló la carga de sesión persistida; se limpió sesión.

## Login y almacenamiento

- `AUTH_RATE_LIMIT` — Exceso de intentos de login en ventana corta.
- `AUTH_TOKEN_INVALID` — Token de Google inválido (vacío o mal formado).
- `AUTH_LOGIN_FAIL` — Fallo general al autenticar.
- `AUTH_STORAGE_SAVE_FAIL` — Falló persistir sesión en storage.

## Refresh token

- `AUTH_REFRESH_NO_TOKEN` — Se intentó refrescar sin token.
- `AUTH_REFRESH_401` — Refresh rechazado (401), sesión expirada.
- `AUTH_REFRESH_EMPTY_TOKEN` — Backend devolvió token vacío.
- `AUTH_REFRESH_FAIL` — Error general al refrescar token.

## Google Sign-In (GSI)

- `AUTH_GSI_SDK_NOT_READY` — SDK de Google no está cargado.
- `AUTH_CLIENT_ID_MISSING` — Client ID no configurado al inicializar GSI.
- `AUTH_CALLBACK_FAIL` — Error en callback de autenticación de GSI.
- `AUTH_GSI_INIT_FAIL` — Error al inicializar Google Sign-In.
- `AUTH_GSI_RENDER_FAIL` — Error al renderizar el botón de GSI.
- `AUTH_GSI_CONTAINER_MISSING` — No se encontró el contenedor del botón en el DOM.
- `AUTH_GSI_ORIGIN_NOT_ALLOWED` — Origen no autorizado en Google Cloud Console.
- `AUTH_GSI_403` — GSI devolvió 403 por origen no autorizado.
- `AUTH_GSI_DIAG_FAIL` — Diagnóstico de GSI fallido (no iframe o error reportado).
- `AUTH_GOOGLE_REVOKE_FAIL` — Falló revocar sesión de Google en logout.

## Otros

- `AUTH_LOGOUT_FAIL` — Error general al cerrar sesión.
- `AUTH_GENERIC_FAIL` — Error genérico no clasificado.
