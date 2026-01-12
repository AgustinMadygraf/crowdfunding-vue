

# crowdfunding-vue

Plataforma de crowdfunding desarrollada en Vue 3 y Vite.

## Descripción

Este proyecto es una aplicación web de crowdfunding que permite a usuarios contribuir a campañas, seguir el progreso de los hitos (milestones), recibir actualizaciones y gestionar su perfil. Está orientado a organizaciones, ONGs o iniciativas que buscan financiamiento colectivo de manera transparente y moderna.

## Funcionalidades principales

- Registro e inicio de sesión de usuarios (incluye autenticación con Google)
- Visualización de niveles de contribución y selección de monto
- Seguimiento de hitos (milestones) y actualizaciones del proyecto
- Integración con Chatwoot para soporte y chat en tiempo real
- Procesamiento de pagos (MercadoPago)
- Panel de usuario con historial de contribuciones y suscripciones
- Gestión y visualización de documentos relevantes
- Sección de preguntas frecuentes (FAQ)
- Panel de administración (AdminView)

## Tecnologías utilizadas

- Vue 3
- Vite
- Pinia (state management)
- Vue Router
- TypeScript
- MercadoPago SDK
- Chatwoot SDK
- Sentry (monitorización de errores)
- ESLint + Volar (calidad de código y soporte TS)

## Estructura de carpetas relevante

- `src/components/` — Componentes reutilizables (auth, layout, milestones, updates, etc.)
- `src/views/` — Vistas principales de la app (Home, Admin, Dashboard, etc.)
- `src/application/` — Lógica de negocio y hooks personalizados
- `src/infrastructure/` — Servicios, repositorios y utilidades de integración
- `src/stores/` — Pinia stores para manejo de estado
- `src/assets/` — Estilos y recursos estáticos
- `src/router/` — Definición de rutas

## Instalación y uso

1. Instala las dependencias:
	```sh
	npm install
	```
2. Ejecuta el entorno de desarrollo:
	```sh
	npm run dev
	```
3. Para compilar y minificar para producción:
	```sh
	npm run build
	```
4. Para analizar el código (lint):
	```sh
	npm run lint
	```

## Variables de entorno

Debes definir las siguientes variables en un archivo `.env` o en el entorno de CI/CD:

- VITE_CHATWOOT_TOKEN
- VITE_CHATWOOT_BASE_URL
- VITE_CHATWOOT_INBOX_IDENTIFIER
- VITE_CHATWOOT_HMAC_TOKEN (opcional, si aplica)

## Contribuir

¡Las contribuciones son bienvenidas! Puedes abrir issues o pull requests para sugerir mejoras, reportar bugs o proponer nuevas funcionalidades.

## Contacto

Para dudas o soporte, utiliza el chat integrado (Chatwoot) o abre un issue en el repositorio.

---
Este proyecto busca facilitar la recaudación de fondos de manera transparente, segura y colaborativa.
