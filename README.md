

# crowdfunding-vue

Plataforma de crowdfunding desarrollada en Vue 3 y Vite.

## DescripciÃ³n

Este proyecto es una aplicaciÃ³n web de crowdfunding que permite a usuarios contribuir a campaÃ±as, seguir el progreso de los hitos (milestones), recibir actualizaciones y gestionar su perfil. EstÃ¡ orientado a organizaciones, ONGs o iniciativas que buscan financiamiento colectivo de manera transparente y moderna.

## Funcionalidades principales

- Registro e inicio de sesiÃ³n de usuarios (incluye autenticaciÃ³n con Google)
- VisualizaciÃ³n de niveles de contribuciÃ³n y selecciÃ³n de monto
- Seguimiento de hitos (milestones) y actualizaciones del proyecto
- IntegraciÃ³n con Chatwoot para soporte y chat en tiempo real
- Procesamiento de pagos (MercadoPago)
- Panel de usuario con historial de contribuciones y suscripciones
- GestiÃ³n y visualizaciÃ³n de documentos relevantes
- SecciÃ³n de preguntas frecuentes (FAQ)
- Panel de administraciÃ³n (AdminView)

## TecnologÃ­as utilizadas

- Vue 3
- Vite
- Pinia (state management)
- Vue Router
- TypeScript
- MercadoPago SDK
- Chatwoot SDK
- Sentry (monitorizaciÃ³n de errores)
- ESLint + Volar (calidad de cÃ³digo y soporte TS)

## Estructura de carpetas relevante

- `src/components/` â€” Componentes reutilizables (auth, layout, milestones, updates, etc.)
- `src/views/` â€” Vistas principales de la app (Home, Admin, Dashboard, etc.)
- `src/application/` â€” LÃ³gica de negocio y hooks personalizados
- `src/infrastructure/` â€” Servicios, repositorios y utilidades de integraciÃ³n
- `src/stores/` â€” Pinia stores para manejo de estado
- `src/assets/` â€” Estilos y recursos estÃ¡ticos
- `src/router/` â€” DefiniciÃ³n de rutas
- `docs/` â€” DocumentaciÃ³n y referencias (ver `docs/AUTH_LOG_CODES.md`)

## InstalaciÃ³n y uso

1. Instala las dependencias:
	```sh
	npm install
	```
2. Ejecuta el entorno de desarrollo:
	```sh
	npm run dev
	```
3. Para compilar y minificar para producciÃ³n:
	```sh
	npm run build
	```
4. Para validar tipos:
	```sh
	npm run type-check
	```
5. Para ejecutar tests:
	```sh
	npm run test -- --run
	```

## Variables de entorno

Debes definir las siguientes variables en archivos de entorno o en CI/CD segÃƒÂºn el entorno.

Frontend (public, Vite):
  - VITE_API_BASE_URL (required at build time in CI/CD)
- VITE_SITE_URL
- VITE_GOOGLE_CLIENT_ID
- VITE_MERCADOPAGO_PUBLIC_KEY
- VITE_CHATWOOT_BASE_URL
- VITE_CHATWOOT_TOKEN
- VITE_CHATWOOT_INBOX_IDENTIFIER
- VITE_CHATWOOT_SDK_INTEGRITY

ProducciÃƒÂ³n (CI/CD, no Vite):
- FTP_DIR
- FTP_PORT
- FTP_SERVER
- FTP_SERVER_IP

## Contribuir

Â¡Las contribuciones son bienvenidas! Puedes abrir issues o pull requests para sugerir mejoras, reportar bugs o proponer nuevas funcionalidades.

## Contacto

Para dudas o soporte, utiliza el chat integrado (Chatwoot) o abre un issue en el repositorio.

---
Este proyecto busca facilitar la recaudaciÃ³n de fondos de manera transparente, segura y colaborativa.

