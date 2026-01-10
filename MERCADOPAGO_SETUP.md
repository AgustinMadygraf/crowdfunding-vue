# 💳 Guía de Configuración - Mercado Pago

## 🎯 Problema Actual

```
v2:1  GET https://api.mercadopago.com/v1/payment_methods/search?public_key=your_public_key_here...
404 (Not Found)
Uncaught (in promise) #<Object>
```

**El error ocurre porque**: La clave de Mercado Pago es un **placeholder** (`your_public_key_here`) en lugar de una clave real.

---

## ✅ Cómo Configurar Mercado Pago

### Paso 1: Obtén tu Public Key

1. Ve a [Mercado Pago Developers](https://www.mercadopago.com.ar/developers/panel/app)
2. **Crea una aplicación** (si no la tienes):
   - Nombre: `crowdfunding-vue` (o el que prefieras)
   - Tipo: `E-commerce`
3. En el panel, verás dos claves:
   - **Public Key** (para el frontend) ← **ESTO NECESITAS**
   - Private Key (para el backend)

### Paso 2: Configura la Clave en .env

Abre tu archivo `.env` en la raíz del proyecto:

```bash
# Antes (❌ INCORRECTO)
VITE_MERCADOPAGO_PUBLIC_KEY=your_public_key_here

# Después (✅ CORRECTO)
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-1234567890-abcdefghij1234567890abcdefghij
```

**Formato de la clave:**
- **Testing (desarrollo)**: `TEST-` (ej: `TEST-1234567890`)
- **Producción**: `APP_USR-` (ej: `APP_USR-1234567890-abcdefghij`)

### Paso 3: Reinicia tu Servidor

```bash
# Presiona Ctrl+C para detener
# Luego ejecuta nuevamente
npm run dev
```

---

## 🔍 Verificar que Está Configurado

### En la Consola (F12)

Deberías ver:

```javascript
[MercadoPago] 🔧 Iniciando configuración de Mercado Pago...
[MercadoPago] 🔑 Public Key: APP_USR-12345... ← SÍ ES UNA CLAVE REAL
[MercadoPago] 📥 Cargando SDK de Mercado Pago...
[MercadoPago] ✅ SDK cargado exitosamente
[MercadoPago] 🔐 Inicializando instancia de Mercado Pago...
[MercadoPago] ✅ SDK inicializado correctamente
```

### Si Ves Este Error

```javascript
[MercadoPago] ❌ VITE_MERCADOPAGO_PUBLIC_KEY es un placeholder
[MercadoPago] Valor actual: your_public_key_here
[MercadoPago] ⚠️ Clave no válida - reemplaza con tu Public Key real
```

**Solución**: Revisa el paso 2 anterior.

---

## 🧪 Claves de Testing

Para probar sin hacer pagos reales, Mercado Pago proporciona claves de testing:

### Public Key de Testing
```
TEST-ab1234cd5678ef1234ab1234cd5678
```

### Tarjetas de Prueba Disponibles

| Tarjeta | Número | Vencimiento | CVC |
|---------|--------|------------|-----|
| VISA | 4509953566233576 | 11/25 | 123 |
| MASTERCARD | 5031755734530604 | 11/25 | 123 |
| AMEX | 378282246310005 | 11/25 | 1234 |

**Estados de Pago:**
- **APROBADO**: Nombre `APRO`
- **RECHAZADO**: Nombre `OTHE`
- **PENDIENTE**: Nombre `CALL`

---

## 📱 Flujo de Pago Completo

### 1. Usuario Selecciona Nivel
```
[Subscribe] 💰 Nivel: Bronce ($100)
```

### 2. Usuario Autenticado (Google)
```
[Subscribe] 👤 Email: usuario@example.com
```

### 3. Click en "Continuar a Pago"
```
[Subscribe] 📝 Creando contribución...
[MercadoPago] 📝 Creando preferencia de pago...
```

### 4. Se Abre Modal de Mercado Pago
```
[MercadoPago] 🛒 Abriendo Mercado Pago Checkout Pro...
[MercadoPago] ✅ Checkout abierto exitosamente
```

### 5. Usuario Completa Pago
- Ingresa datos de tarjeta
- Autoriza pago

### 6. Redirect a Página de Resultado
```
[MercadoPago] ✅ Pago aprobado
[Subscribe] 📊 Parámetros de pago detectados
```

---

## 🚨 Errores Comunes y Soluciones

### Error: "Public Key not configured"
```javascript
[MercadoPago] ❌ VITE_MERCADOPAGO_PUBLIC_KEY no está configurada
```

**Solución:**
1. Abre el archivo `.env`
2. Agrega tu Public Key real
3. Reinicia el servidor (`npm run dev`)

---

### Error: "404 Not Found" en payment_methods
```javascript
GET https://api.mercadopago.com/v1/payment_methods/search?public_key=your_public_key_here... 404
```

**Causa**: La Public Key es un placeholder (`your_public_key_here`)

**Solución**: Sigue el Paso 2 anterior

---

### Error: "SDK not initialized"
```javascript
[MercadoPago] ❌ SDK de Mercado Pago no está inicializado
```

**Posibles causas:**
1. La Public Key es inválida
2. No hay conexión a mercadopago.com
3. Hay un bloqueador de scripts

**Soluciones:**
1. Verifica que la clave sea válida (no `your_public_key_here`)
2. Verifica tu conexión a internet
3. Desactiva bloqueadores de ads/scripts
4. Recarga la página

---

### Error: "Failed to create preference"
```javascript
[MercadoPago] ❌ Error al crear preferencia de pago
[MercadoPago] 🌐 URL del servidor: http://localhost:5000
```

**Posibles causas:**
1. Backend no está ejecutándose
2. URL del backend es incorrecta
3. Problemas de CORS

**Soluciones:**
1. Verifica que el backend está corriendo: `python app.py`
2. Verifica `VITE_API_BASE_URL` en `.env`
3. Verifica CORS en el backend (debe permitir `localhost:5173`)

---

### Error: "Uncaught (in promise) #<Object>"
```javascript
Uncaught (in promise) #<Object>
```

**Causa**: Error no manejado en el SDK de Mercado Pago (generalmente por clave inválida)

**Solución**: Abre F12 y busca el log anterior que explique el error real

---

## 💡 Tips de Debugging

### 1. Verifica la Consola Completa
Busca todos los logs `[MercadoPago]`:

```bash
# Filtro en F12 Console
[MercadoPago]
```

### 2. Verifica las Variables de Entorno
```bash
# En la consola del navegador
import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY
```

Debería mostrar algo como: `APP_USR-1234567...`

### 3. Verifica el Network Tab
- F12 → Network
- Busca requests a `api.mercadopago.com`
- Verifica que la `public_key` en la URL **NO sea** `your_public_key_here`

### 4. Reinicia Todo
```bash
# 1. Detén el servidor (Ctrl+C)
# 2. Borra node_modules y reconstruye
npm install

# 3. Inicia de nuevo
npm run dev

# 4. Abre nueva pestaña en incógnito
# 5. Ve a http://localhost:5173
```

---

## 📊 Estructura del Flujo de Pago

```
SubscribeView.vue (onMounted)
    ↓
initMercadoPago() [mercadopagoService.ts]
    ↓ (verifica Public Key)
    ↓ (carga SDK)
    ↓ (inicializa instancia MercadoPago)
    ↓
✅ SDK Listo

User clicks "Continuar a Pago"
    ↓
handleSubmit() [SubscribeView.vue]
    ↓
createContribution() [SubscribeView.vue]
    ↓
POST /api/contributions [Backend]
    ↓
✅ Contribución creada + preference_id

handlePayment() [SubscribeView.vue]
    ↓
router.push(`/subscribe/${token}`) [SubscribePaymentView.vue]
    ↓
SubscribePaymentView inicializa checkout
    ↓
initiatePayment() [mercadopagoService.ts]
    ↓
openCheckout(preference_id) [mercadopagoService.ts]
    ↓
🛒 Modal de Mercado Pago abierto
    ↓
Usuario completa pago
    ↓
Redirect a success/failure/pending URL
```

---

## 📝 Archivo .env Completo

```env
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=995644823822-6215fe0itfvrop0qs0oa0ouhplub5qc8.apps.googleusercontent.com

# Chatwoot Configuration
VITE_CHATWOOT_TOKEN=ywXi81gVYc63S2SaWBHb7Tk5
VITE_CHATWOOT_BASE_URL=https://chatwoot.madygraf.com
VITE_CHATWOOT_INBOX_IDENTIFIER=co8gLNFFYhmzq3DiRjc1xy3s
VITE_CHATWOOT_HMAC_TOKEN=1

# Backend API
VITE_API_BASE_URL=http://localhost:5000

# MercadoPago (⭐ IMPORTANTE)
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-tu-public-key-aqui
```

---

## 🔗 Enlaces Útiles

- [Mercado Pago Developers](https://www.mercadopago.com.ar/developers/panel/app)
- [SDK Reference](https://www.mercadopago.com.ar/developers/es/reference/checkout-web)
- [Integración Web Checkout](https://www.mercadopago.com.ar/developers/es/guides/checkout-web/introduction)
- [Testing Cards](https://www.mercadopago.com.ar/developers/es/guides/resources/localization/test-cards)

---

## ✅ Checklist de Configuración

- [ ] Cree una aplicación en Mercado Pago Developers
- [ ] Copie la **Public Key** (no la Private Key)
- [ ] Actualicé `.env` con: `VITE_MERCADOPAGO_PUBLIC_KEY=...`
- [ ] Reinicié el servidor (`npm run dev`)
- [ ] Abrí F12 → Console
- [ ] Vi ✅ logs de "SDK inicializado correctamente"
- [ ] Probé un pago con tarjeta de testing
- [ ] Recibí confirmación de pago

---

**Última actualización**: Enero 10, 2026
**Mejora realizada**: Logging detallado con emojis y manejo robusto de errores
