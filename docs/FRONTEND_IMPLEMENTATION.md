# Frontend - Sistema de Contribuciones por Usuario

## ✅ Implementación Completada

Se ha refactorizado completamente el sistema de suscripción para implementar contribuciones individuales por usuario con autenticación Google.

---

## 📁 Archivos Creados y Modificados

### Nuevos Archivos

#### Servicios de Autenticación
- **[src/infrastructure/services/authService.ts](src/infrastructure/services/authService.ts)**
  - Servicio principal de autenticación con Google
  - Gestiona login/logout y sesiones
  - Almacena datos en localStorage
  - Integración con Google Identity Services

#### Dominio
- **[src/domain/user.ts](src/domain/user.ts)**
  - Interfaces de Usuario
  - Estructura de datos para usuarios y contribuciones

#### Componentes
- **[src/components/auth/GoogleAuthButton.vue](src/components/auth/GoogleAuthButton.vue)**
  - Botón de login con Google
  - Renderización automática del botón de Google
  - Emit de eventos de éxito/error/logout

#### Vistas
- **[src/views/SubscribePaymentView.vue](src/views/SubscribePaymentView.vue)**
  - Página individual de pago por token
  - Muestra estado de la contribución
  - Integración con MercadoPago
  - Accesible públicamente (por token)

- **[src/views/UserDashboardView.vue](src/views/UserDashboardView.vue)**
  - Dashboard del usuario autenticado
  - Historial completo de contribuciones
  - Estadísticas (total aportado, completadas, pendientes)
  - Acceso a páginas de pago individuales
  - Logout

### Archivos Modificados

#### Vistas
- **[src/views/SubscribeView.vue](src/views/SubscribeView.vue)**
  - ✏️ Refactorizado para integrar Google OAuth
  - Modal de autenticación
  - Flujo mejorado: Auth → Seleccionar nivel → Crear contribución → Pagar
  - Integración con authService
  - Creación de contribuciones en backend

#### Router
- **[src/router/index.ts](src/router/index.ts)**
  - Agregadas rutas: `/subscribe/:token`, `/account`
  - Configuración de meta tags

#### Configuración
- **[.env.example](.env.example)**
  - Agregada variable `VITE_GOOGLE_CLIENT_ID`

---

## 🔧 Configuración Necesaria

### 1. Google OAuth Setup

#### Obtener Credenciales

```bash
# Ve a https://console.cloud.google.com
# 1. Crea un proyecto nuevo
# 2. Habilita "Google+ API"
# 3. Ve a "Credenciales" → "Crear credencial"
# 4. Tipo: "OAuth 2.0 Client ID"
# 5. Aplicación: "Aplicación web"
# 6. Redirect URIs:
#    - http://localhost:5173 (desarrollo local)
#    - http://localhost:3000 (si usas otro puerto)
#    - https://tudominio.com (producción)
# 7. Copia el "Client ID"
```

#### Configurar Variable de Entorno

```env
# .env
VITE_GOOGLE_CLIENT_ID=xxxxx-xxxxxxxxxxxxxxx.apps.googleusercontent.com
```

### 2. Backend API (Requerido)

El frontend requiere estos endpoints del backend:

#### Autenticación
```
POST /api/auth/google
  Body: { "token": "google_id_token" }
  Response: {
    "user_id": "uuid",
    "email": "user@example.com",
    "nombre": "Usuario",
    "avatar_url": "https://...",
    "auth_token": "jwt_token"
  }
```

#### Contribuciones
```
POST /api/contributions
  Headers: { "Authorization": "Bearer jwt_token" }
  Body: {
    "user_id": "uuid",
    "monto": 500,
    "nivel_id": "bronze",
    "nivel_nombre": "Nivel Bronce",
    ...
  }
  Response: {
    "token": "mp_unique_token",
    "preference_id": "mercadopago_preference_id"
  }

GET /api/contributions/:token
  Response: { "id", "monto", "nivel_nombre", "estado_pago", ... }

GET /api/users/:user_id/contributions
  Headers: { "Authorization": "Bearer jwt_token" }
  Response: [{ contribution_object }]
```

---

## 🔄 Flujo de Contribución (Frontend)

### 1. Usuario Entra a /subscribe

```
┌─────────────────────────────────┐
│   ¿Autenticado con Google?      │
└─────────────────────────────────┘
        ↙                ↘
      SÍ                 NO
      ↓                  ↓
   Cargar datos     Modal de
   del usuario      Google Auth
      ↓                  ↓
      └────────┬─────────┘
               ↓
```

### 2. Seleccionar Nivel

```
┌──────────────────────────┐
│ Selecciona tu nivel:     │
│ ☐ Bronce ($50)           │
│ ☐ Plata ($100)           │
│ ☐ Oro ($500)             │
└──────────────────────────┘
```

### 3. Confirmar con Google y Crear Contribución

```
┌──────────────────────────┐
│ Usuario autenticado      │
│ Nivel seleccionado       │
│ [Continuar al pago]      │
└──────────────────────────┘
```

El usuario autenticado continúa sin completar formulario adicional. La contribución se crea con los datos del usuario (Google) y el nivel seleccionado.

### 4. Crear Contribución

```
Backend:
  POST /api/contributions
    ↓
  Crea registro en BD
  Genera token único
  Crea preference en MercadoPago
    ↓
  Frontend:
    Guarda token
    Muestra "Contribución Registrada"
```

### 5. Ir a Pagar

```
User hace click: [Ir a Pagar]
  ↓
Redirige a: /subscribe/:token
  ↓
Muestra página de pago
Integra MercadoPago
User completa transacción
```

---

## 📱 Componentes Principales

### GoogleAuthButton.vue

```vue
<GoogleAuthButton 
  @auth-success="handleAuthSuccess"
  @auth-error="handleAuthError"
  @logout="handleLogout"
/>
```

**Props:**
- `buttonContainerId` (string): ID del contenedor para el botón

**Eventos:**
- `auth-success(user)`: Usuario autenticado exitosamente
- `auth-error(error)`: Error durante autenticación
- `logout()`: Usuario hizo logout

### SubscribePaymentView.vue

**Props:** 
- `token` (route param): Token único de la contribución

**Características:**
- Carga datos de la contribución
- Muestra estado del pago
- Botón para iniciar MercadoPago
- Información pública (accesible sin auth)

### UserDashboardView.vue

**Requirementos:**
- Usuario debe estar autenticado

**Características:**
- Historial de contribuciones del usuario
- Estadísticas (total, completadas, pendientes)
- Enlaces a páginas de pago individuales
- Botón para nueva contribución
- Logout

---

## 🔐 Autenticación y Seguridad

### Flujo de Tokens

```
1. Usuario hace login con Google
2. Google genera ID Token
3. Frontend envía a backend: POST /api/auth/google { token }
4. Backend valida token con Google
5. Backend crea usuario (si es nuevo)
6. Backend genera JWT
7. Frontend almacena JWT en localStorage
8. Todas las requests incluyen: Authorization: Bearer JWT
```

### Protección

- ✅ Google OAuth 2.0 para autenticación
- ✅ JWT tokens para autorización
- ✅ localStorage seguro (no XSS en producción)
- ✅ Headers de autorización en requests
- ✅ Tokens únicos e impredecibles para contribuciones

---

## 🧪 Testing Manual

### Flujo Completo

```bash
# 1. Inicia servidor de desarrollo
npm run dev

# 2. Abre http://localhost:5173/subscribe
# 3. Hace click en "Continuar con Google"
# 4. Selecciona cuenta Google
# 5. Debe redirecionarse y mostrar datos del usuario
# 6. Selecciona un nivel
# 7. Hace click "Continuar al pago"
# 8. Debe crear contribución y redirigir a /subscribe/:token
# 9. Debe mostrar página de pago
# 10. Hace click "Ir a Pagar" → Abre MercadoPago
# 11. Completa pago con tarjeta de prueba
# 12. Debe actualizar estado a "Completado"
```

### Verificar Datos Almacenados

```javascript
// Abre consola del navegador
localStorage.getItem('auth_token')      // Debe mostrar JWT
localStorage.getItem('auth_user')       // Debe mostrar objeto usuario

// Verificar authService
window.__authService = authService;
window.__authService.getCurrentUser()   // Retorna usuario actual
window.__authService.getAuthToken()     // Retorna JWT
```

---

## 📚 Servicios Disponibles

### authService

```typescript
import { authService } from '@/infrastructure/services/authService'

// Métodos públicos
authService.getCurrentUser()        // User | null
authService.getAuthToken()          // string | null
authService.isAuthenticated()       // boolean
authService.getAuthState()          // Estado completo
authService.getAuthHeaders()        // Headers con Authorization
authService.logout()                // Cierra sesión
authService.loginWithGoogle(token)  // Login con Google
```

---

## 🐛 Debugging

### Habilitar Logging

Todos los servicios usan `console.log` con prefijos:

```javascript
// Logs de autenticación
[Auth] Usuario autenticado: usuario@example.com

// Logs de contribuciones
[Subscribe] Creating contribution...

// Logs de pagos
[SubscribePayment] Loading contribution...
```

### Verificar Errores

```javascript
// Abre DevTools → Console
// Todos los errores tienen prefix:
[Auth] Error...
[Subscribe] Error...
[SubscribePayment] Error...
```

---

## 🚀 Próximos Pasos

### Backend Requerido

1. **Implementar endpoints de autenticación**
   - POST /api/auth/google

2. **Implementar endpoints de contribuciones**
   - POST /api/contributions
   - GET /api/contributions/:token
   - GET /api/users/:user_id/contributions

3. **Implementar modelo de datos**
   - Tabla users
   - Tabla contributions

4. **Implementar webhooks de MercadoPago**
   - POST /api/webhooks/mercadopago

### Frontend Adicional

1. **Mejorar UX**
   - Loading skeletons
   - Animaciones
   - Error boundaries

2. **Validaciones adicionales**
   - Verificar token válido
   - Manejo de errores 404

3. **Integraciones**
   - Analytics
   - Sentry para error tracking

---

## 📖 Referencias

- [Google Identity Services](https://developers.google.com/identity/gsi/web)
- [MercadoPago Payments](https://developers.mercadopago.com/)
- [Vue 3 Docs](https://vuejs.org/)
- [Vue Router 4](https://router.vuejs.org/)

---

## ✅ Checklist

- [ ] Configurar Google Client ID
- [ ] Implementar backend endpoints
- [ ] Crear modelos de BD (users, contributions)
- [ ] Implementar webhooks de MercadoPago
- [ ] Testing manual del flujo completo
- [ ] Testing de seguridad
- [ ] Desplegar a producción
- [ ] Configurar URLs de Google OAuth para producción
