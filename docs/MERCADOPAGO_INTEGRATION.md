# Integración MercadoPago - Madypack Portal

**Fecha:** 2026-01-10  
**Status:** ✅ Frontend completado | ⏳ Backend preparado

---

## 📊 Resumen

Integración completa de MercadoPago para procesamiento de pagos en el portal de crowdfunding Madypack.

### ✅ Frontend (Completado)

1. **SDK instalado:** `@mercadopago/sdk-js`
2. **Servicio creado:** `src/infrastructure/mercadopagoService.ts`
3. **Flujo implementado:** Pre-registro → Pago → Webhook
4. **UI actualizada:** `SubscribeView.vue` con botón de pago
5. **Variables configuradas:** `.env.example` actualizado

### ⏳ Backend (Estructura preparada)

1. **Flask app:** `backend/app.py`
2. **Endpoints:** 
   - `POST /api/payments/create` - Crear preferencia
   - `POST /api/webhooks/mercadopago` - Recibir notificaciones
3. **Servicios:**
   - `services/mercadopago.py` - Cliente MercadoPago
   - `services/chatwoot.py` - Actualizar contactos
4. **Documentación:** `backend/README.md`

---

## 🔧 Flujo Completo

```
Usuario → Formulario → Chatwoot Contact Created
    ↓
Botón "Pagar con MercadoPago"
    ↓
Frontend → POST /api/payments/create
    ↓
Backend → MercadoPago API (create preference)
    ↓
Frontend recibe preference_id
    ↓
Abre Checkout Pro (modal o redirect)
    ↓
Usuario paga
    ↓
MercadoPago → Webhook → Backend
    ↓
Backend → Chatwoot (actualizar status)
    ↓
Usuario → Página de éxito
```

---

## 📝 Pasos para completar

### 1. Obtener credenciales MercadoPago

1. Ir a https://www.mercadopago.com.ar/developers/panel/app
2. Crear aplicación "Madypack Crowdfunding"
3. Copiar credenciales:
   - **Public Key** (para frontend) → `VITE_MERCADOPAGO_PUBLIC_KEY`
   - **Access Token** (para backend) → `MERCADOPAGO_ACCESS_TOKEN`

**Para testing:** Usar credenciales de prueba (empiezan con `TEST-`)

### 2. Configurar backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Crear `backend/.env`:
```env
MERCADOPAGO_ACCESS_TOKEN=TEST-your-access-token
MERCADOPAGO_PUBLIC_KEY=TEST-your-public-key
MERCADOPAGO_WEBHOOK_SECRET=your-webhook-secret

CHATWOOT_API_URL=https://chatwoot.madygraf.com
CHATWOOT_ACCOUNT_ID=1
CHATWOOT_INBOX_ID=1
CHATWOOT_API_ACCESS_TOKEN=your-chatwoot-token

FLASK_ENV=development
SECRET_KEY=dev-secret-key-123
PORT=5000
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:4173
```

Iniciar backend:
```bash
python app.py
# Backend corriendo en http://localhost:5000
```

### 3. Configurar frontend

Actualizar `.env`:
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-your-public-key
```

Reiniciar frontend:
```bash
npm run dev
```

### 4. Configurar webhook en MercadoPago

1. Ir a MercadoPago Dashboard → Webhooks
2. Agregar URL: `https://your-domain.com/api/webhooks/mercadopago`
3. Eventos: `payment.created`, `payment.updated`
4. Copiar **Webhook Secret** → `MERCADOPAGO_WEBHOOK_SECRET`

---

## 🧪 Testing

### Test Frontend (local)

1. Ir a http://localhost:5173/suscribir
2. Completar formulario
3. Click "Completar pre-registro" → Éxito
4. Click "💳 Pagar con MercadoPago"
5. Debe abrir modal/redirect de MercadoPago

### Test Backend (local)

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test payment creation
curl -X POST http://localhost:5000/api/payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "contact_id": "lead_test_123",
    "level_id": 100000,
    "items": [{
      "title": "Test",
      "quantity": 1,
      "unit_price": 100000,
      "currency_id": "ARS"
    }],
    "payer": {
      "email": "test@test.com",
      "name": "Test"
    },
    "back_urls": {
      "success": "http://localhost:5173/success",
      "failure": "http://localhost:5173/failure",
      "pending": "http://localhost:5173/pending"
    }
  }'
```

### Test con tarjetas de prueba

MercadoPago provee tarjetas de testing:

| Tarjeta | Número | CVV | Fecha | Resultado |
|---------|--------|-----|-------|-----------|
| Mastercard | 5031 7557 3453 0604 | 123 | 11/25 | Aprobado |
| Visa | 4509 9535 6623 3704 | 123 | 11/25 | Aprobado |
| Visa | 4774 0614 6340 6836 | 123 | 11/25 | Rechazado |

**Titular:** Cualquier nombre  
**DNI:** 12345678

---

## 📦 Archivos creados/modificados

### Frontend
- ✅ `src/infrastructure/mercadopagoService.ts` (nuevo)
- ✅ `src/views/SubscribeView.vue` (modificado)
- ✅ `.env.example` (actualizado)
- ✅ `package.json` (nueva dependencia)

### Backend
- ✅ `backend/app.py` (nuevo)
- ✅ `backend/requirements.txt` (nuevo)
- ✅ `backend/.env.example` (nuevo)
- ✅ `backend/routes/payments.py` (nuevo)
- ✅ `backend/routes/webhooks.py` (nuevo)
- ✅ `backend/services/mercadopago.py` (nuevo)
- ✅ `backend/services/chatwoot.py` (nuevo)
- ✅ `backend/README.md` (nuevo)

---

## 🚀 Deploy

### Frontend (GitHub Actions → Ferozo)
Ya configurado. Agregar variables de entorno en GitHub Secrets:
- `VITE_MERCADOPAGO_PUBLIC_KEY` (usar credenciales de producción)

### Backend (PythonAnywhere)

1. Crear cuenta en PythonAnywhere.com
2. Subir código con git o zip
3. Crear virtualenv y instalar dependencias
4. Configurar WSGI file
5. Configurar variables de entorno
6. Configurar webhook URL en MercadoPago

Ver: `backend/README.md` para detalles

---

## ✅ Checklist de producción

- [ ] Credenciales de producción de MercadoPago
- [ ] Backend desplegado en PythonAnywhere
- [ ] Variables de entorno configuradas (frontend + backend)
- [ ] Webhook configurado en MercadoPago
- [ ] Webhook URL accesible públicamente (HTTPS)
- [ ] Testing con tarjetas de prueba
- [ ] Testing end-to-end completo
- [ ] Monitoreo de webhooks (logs)

---

## 🐛 Troubleshooting

### "MercadoPago SDK not initialized"
- Verificar `VITE_MERCADOPAGO_PUBLIC_KEY` en `.env`
- Verificar que el SDK se cargó: `console.log` en browser

### "Failed to create payment preference"
- Backend no está corriendo (verificar `http://localhost:5000/health`)
- CORS mal configurado
- Credenciales inválidas

### "Webhook not received"
- URL no es pública (usar ngrok en desarrollo)
- Signature validation falló
- Backend crasheó (ver logs)

---

**Última actualización:** 2026-01-10  
**Próximo paso:** Configurar credenciales + iniciar backend
