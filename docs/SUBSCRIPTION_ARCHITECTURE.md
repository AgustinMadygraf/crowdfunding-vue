# Arquitectura de Suscripciones - Sistema Dividido por Usuario

## 📋 Visión General

Sistema de contribuciones donde cada usuario:
1. Se autentica via **Google OAuth**
2. Puede hacer **múltiples contribuciones** en el tiempo
3. Accede a su **página personal de pago** con token único
4. Ve **historial completo** de sus contribuciones

---

## 🏗️ Arquitectura de Base de Datos

### Tabla: `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  nombre VARCHAR(255),
  google_id VARCHAR(255) UNIQUE,  -- ID de Google
  avatar_url VARCHAR(512),        -- Foto de perfil de Google
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: `contributions`
```sql
CREATE TABLE contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Información de la contribución
  monto DECIMAL(10, 2) NOT NULL,
  nivel_id UUID NOT NULL,          -- ID del nivel de contribución
  nivel_nombre VARCHAR(255),       -- Nombre del nivel (snapshot)
  
  -- Pago
  token VARCHAR(64) UNIQUE NOT NULL, -- Token único para acceso a página
  estado_pago VARCHAR(50) DEFAULT 'pendiente', 
    -- pendiente, procesando, completado, fallido, cancelado
  mercadopago_preference_id VARCHAR(255),
  mercadopago_payment_id VARCHAR(255),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,  -- Fecha en que se completó el pago
  
  INDEX (user_id),
  INDEX (token),
  INDEX (mercadopago_preference_id)
);
```

---

## 🔐 Autenticación: Google OAuth

### Flujo de Autenticación

```
1. Usuario entra a /subscribe
2. Si NO está autenticado → Botón "Continuar con Google"
3. Google OAuth popup
4. Backend verifica token de Google
5. Si es nuevo → Crea usuario en BD
6. Si existe → Actualiza último acceso
7. Se guarda sesión/JWT
```

### Configuración Necesaria

En `.env`:
```env
VITE_GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
VITE_API_BASE_URL=http://localhost:5000
```

Backend debe tener endpoint:
```
POST /api/auth/google
  {
    "token": "google_id_token"
  }
  
Respuesta:
  {
    "user_id": "uuid",
    "email": "user@example.com",
    "nombre": "Usuario",
    "auth_token": "jwt_token"
  }
```

---

## 📍 Rutas y Vistas

### 1. `/subscribe` - Selección de Nivel
**Componente:** `SubscribeView.vue` (refactorizado)

```
┌─────────────────────────────────┐
│   ¿No estás autenticado?        │
│   [Continuar con Google]        │
└─────────────────────────────────┘
        ↓ (después de autenticar)
┌─────────────────────────────────┐
│   Hola, {nombre}                │
│   Selecciona tu aporte:         │
│   ☐ Nivel Bronce ($50)          │
│   ☐ Nivel Plata ($100)          │
│   ☐ Nivel Oro ($500)            │
│   [Continuar →]                 │
└─────────────────────────────────┘
```

**Flujo:**
1. Usuario autenticado selecciona nivel
2. Backend crea registro en tabla `contributions` (estado: pendiente)
3. Backend genera token único
4. Redirige a `/subscribe/{token}`

**Props/Data:**
- Usuario actual (de Google)
- Niveles disponibles
- Estado de contribución en progreso

---

### 2. `/subscribe/{token}` - Página Individual de Pago
**Componente:** `SubscribePaymentView.vue` (NUEVO)

```
┌──────────────────────────────────────┐
│   Tu página de contribución          │
│                                      │
│   Nivel: Oro                         │
│   Monto: $500                        │
│   Estado: ⏳ Pendiente de pago       │
│                                      │
│   [Abrir MercadoPago para pagar]    │
│   o                                  │
│   [Iframe de MercadoPago]            │
└──────────────────────────────────────┘
```

**Flujo:**
1. URL tiene token único
2. Verifica token en BD
3. Muestra contribución asociada
4. Integra MercadoPago (preferencia pre-generada)
5. Webhook actualiza estado cuando pago completa

**Características:**
- ✅ Públicamente accesible (por token)
- ✅ Usuario autenticado ve su historial
- ✅ Si no está autenticado, solo ve su pago actual
- ✅ Si vuelve después, puede ver estado actualizado

---

### 3. `/account` o `/dashboard` - Historial de Usuario
**Componente:** `UserDashboardView.vue` (NUEVO)

```
┌───────────────────────────────────────┐
│   Hola, {nombre}                      │
│   Email: {email}                      │
│   [Logout]                            │
├───────────────────────────────────────┤
│   Mis Contribuciones:                 │
│                                       │
│   1. Oro - $500 - ✅ Completado      │
│      Pago realizado el 15/01/2025    │
│      [Ver detalles]                   │
│                                       │
│   2. Plata - $100 - ⏳ Pendiente     │
│      [Completar pago]                 │
│                                       │
│   3. Bronce - $50 - ✅ Completado    │
│      Pago realizado el 10/01/2025    │
│      [Ver detalles]                   │
└───────────────────────────────────────┘
```

**Características:**
- ✅ Requiere Google autenticado
- ✅ Muestra todas las contribuciones del usuario
- ✅ Muestra estado de cada una
- ✅ Enlaces para completar pagos pendientes
- ✅ Logout

---

## 🔄 Flujo Completo de Contribución

```
1. SELECCIÓN
   User → GET /subscribe
   User NO autenticado → Login con Google
   User selecciona nivel → POST /api/contributions (backend)

2. CREACIÓN
   Backend:
     - Crea registro en tabla contributions
     - Genera token único (32 caracteres aleatorios)
     - Crea preference en MercadoPago
     - Retorna URL: /subscribe/{token}

3. PAGO
   User → GET /subscribe/{token}
   Ver detalles y botón MercadoPago
   User paga en MercadoPago

4. CONFIRMACIÓN
   MercadoPago webhook → POST /api/webhooks/mercadopago
   Backend actualiza contributions.estado_pago = 'completado'
   Backend actualiza contributions.completed_at = NOW()

5. SEGUIMIENTO
   User puede:
     a) Volver a /subscribe/{token} → Ver estado actualizado
     b) Ir a /account → Ver historial de todas sus contribuciones
     c) Si necesita pagar de nuevo → /account → Botón para completar pago
```

---

## 🔗 URLs y Tokens

### Token de Contribución

```
Características:
- Longitud: 32-64 caracteres
- Formato: Base36 o UUID
- Único por contribución
- No expira (válido para siempre)
- Uso: /subscribe/{token}

Generación:
  Token = random_base36(32)
  
Ejemplo:
  /subscribe/mp_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
  /subscribe/550e8400-e29b-41d4-a716-446655440000
```

---

## 🔌 Integración con MercadoPago

### Cuando se crea una Contribución

```
POST /api/contributions
{
  "user_id": "uuid",
  "monto": 500,
  "nivel_id": "uuid"
}

Backend:
1. Crea registro en contributions (estado: pendiente)
2. Genera token único
3. Crea preference en MercadoPago:
   {
     "items": [{
       "title": "Contribución Nivel Oro",
       "quantity": 1,
       "unit_price": 500
     }],
     "back_urls": {
       "success": "https://app.com/subscribe/{token}?status=success",
       "failure": "https://app.com/subscribe/{token}?status=failure"
     },
     "external_reference": "{contribution_id}",
     "notification_url": "https://api.com/webhooks/mercadopago"
   }
4. Guarda preference_id en BD
5. Retorna:
   {
     "contribution_id": "uuid",
     "token": "mp_xxx",
     "mercadopago_url": "https://checkout.mercadopago.com/..."
   }
```

---

## 📊 Estados de Pago

```
pendiente
  ↓
procesando (cuando user abre MercadoPago)
  ↓
completado ✅ (webhook confirmó pago)
  o
fallido ❌ (user canceló o tarjeta rechazada)
  ↓
Usuario puede reintentar desde /account
```

---

## 🛡️ Seguridad

### Protección de Token

- ✅ Token único por contribución
- ✅ No predecible (random)
- ✅ Acceso sin autenticación (pero token válida por contribución específica)
- ✅ Si no autenticado, solo ve su token específico
- ✅ Si autenticado, puede ver todas sus contribuciones

### Protección de Datos

- ✅ MercadoPago nunca se ve en BD directamente (solo en API calls)
- ✅ Webhook de MercadoPago verifica firma
- ✅ Google OAuth para autenticación
- ✅ JWT para sesiones

---

## 🗄️ Migraciones Backend Requeridas

```python
# Flask-SQLAlchemy models

class User(db.Model):
    id = db.Column(UUID, primary_key=True, default=uuid4)
    email = db.Column(String(255), unique=True, nullable=False)
    nombre = db.Column(String(255))
    google_id = db.Column(String(255), unique=True)
    avatar_url = db.Column(String(512))
    created_at = db.Column(DateTime, default=datetime.utcnow)
    updated_at = db.Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    contributions = db.relationship('Contribution', backref='user', lazy=True, cascade='all, delete-orphan')

class Contribution(db.Model):
    id = db.Column(UUID, primary_key=True, default=uuid4)
    user_id = db.Column(UUID, ForeignKey('user.id'), nullable=False)
    
    monto = db.Column(Float, nullable=False)
    nivel_id = db.Column(UUID)
    nivel_nombre = db.Column(String(255))
    
    token = db.Column(String(64), unique=True, nullable=False)
    estado_pago = db.Column(String(50), default='pendiente')
    mercadopago_preference_id = db.Column(String(255))
    mercadopago_payment_id = db.Column(String(255))
    
    created_at = db.Column(DateTime, default=datetime.utcnow)
    updated_at = db.Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = db.Column(DateTime)
```

---

## 📱 Componentes Vue a Crear/Modificar

```
src/views/
  ✏️ SubscribeView.vue (REFACTORIZAR)
     - Selección de nivel
     - Autenticación Google
     
  ✨ SubscribePaymentView.vue (NUEVO)
     - Página individual de pago
     - Muestra estado de pago
     - Integración MercadoPago
     
  ✨ UserDashboardView.vue (NUEVO)
     - Historial de contribuciones
     - Requiere autenticación
     - Links a pagos pendientes

src/components/
  ✨ GoogleAuthButton.vue (NUEVO)
     - Botón de login con Google
     
  ✨ ContributionCard.vue (NUEVO)
     - Card individual de contribución
     - Muestra estado, monto, fecha
```

---

## 🔄 Cambios en Router

```typescript
// router/index.ts

const routes = [
  // ... existentes ...
  
  {
    path: '/subscribe',
    component: SubscribeView,
    name: 'subscribe',
    meta: { requiresAuth: true } // Redirige a Google si no autenticado
  },
  
  {
    path: '/subscribe/:token',
    component: SubscribePaymentView,
    name: 'subscribe-payment',
    meta: { requiresAuth: false } // Público, pero token debe ser válido
  },
  
  {
    path: '/account',
    component: UserDashboardView,
    name: 'account',
    meta: { requiresAuth: true } // Requiere Google autenticado
  }
];
```

---

## ✅ Checklist de Implementación

### Backend
- [ ] Crear modelos User y Contribution
- [ ] Crear migration de BD
- [ ] Implementar autenticación Google
- [ ] Endpoint: POST /api/auth/google
- [ ] Endpoint: POST /api/contributions
- [ ] Endpoint: GET /api/contributions/{token}
- [ ] Endpoint: GET /api/users/{user_id}/contributions
- [ ] Webhook: POST /api/webhooks/mercadopago
- [ ] Generar tokens únicos

### Frontend
- [ ] Componente GoogleAuthButton.vue
- [ ] Refactorizar SubscribeView.vue
- [ ] Crear SubscribePaymentView.vue
- [ ] Crear UserDashboardView.vue
- [ ] Crear ContributionCard.vue
- [ ] Actualizar router
- [ ] Actualizar servicios (API calls)
- [ ] Google OAuth configuración

### Testing
- [ ] Crear usuario con Google
- [ ] Crear contribución
- [ ] Verificar token único
- [ ] Pagar con MercadoPago
- [ ] Ver pago en historial
- [ ] Múltiples contribuciones por usuario
