# Integración de Sentry en Crowdfunding Vue

## 1. ¿Qué es Sentry?
Sentry es una plataforma de monitoreo de errores y performance para aplicaciones web. Permite capturar, reportar y analizar errores en tiempo real, facilitando la detección y resolución de problemas en producción.

## 2. Configuración en el proyecto

### Variables de entorno
Agrega las siguientes variables en tu archivo `.env` y `.env.example`:

```
# Sentry
VITE_SENTRY_DSN=tu_dsn_de_sentry
VITE_SENTRY_ENVIRONMENT=production
```

- `VITE_SENTRY_DSN`: El DSN de tu proyecto Sentry (lo obtienes desde https://sentry.io).
- `VITE_SENTRY_ENVIRONMENT`: El entorno de despliegue (ejemplo: production, staging, development).

### Inicialización en el código
La inicialización de Sentry se realiza en `src/main.ts` usando el logger centralizado:

```typescript
if (import.meta.env.PROD) {
  Logger.setupSentry({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: 1.0,
  })
}
```

### Captura global de errores
El logger captura errores globales y promesas no manejadas:

```typescript
window.addEventListener('error', (event) => {
  Logger.error('Global error', event)
})
window.addEventListener('unhandledrejection', (event) => {
  Logger.error('Unhandled promise rejection', event.reason)
})
```

## 3. Uso recomendado
- Utiliza siempre el logger centralizado (`Logger.error`, `Logger.warn`, `Logger.info`) para reportar errores.
- No incluyas datos sensibles en los mensajes de error.
- Verifica que el DSN esté correctamente configurado antes de desplegar.

## 4. Validación
- Genera un error en desarrollo y verifica que aparece en el dashboard de Sentry.
- Revisa el dashboard para confirmar la recepción de eventos.

## 5. Recursos
- [Documentación oficial de Sentry](https://docs.sentry.io/platforms/javascript/)
- [Logger centralizado](../src/infrastructure/logger.ts)

---

Esta guía debe agregarse a la documentación interna del proyecto para asegurar la correcta integración y uso de Sentry.