# ⚡ TL;DR (Too Long; Didn't Read)

## Lo Esencial en 30 Segundos

### Google OAuth Error 403
```
❌ Ves: "The given origin is not allowed"

✅ Solución:
1. Abre F12 Console
2. Busca "Origen actual: "
3. Copia esa URL (ej: http://localhost:5173)
4. Ve a https://console.cloud.google.com/
5. Credentials > OAuth Client > Authorized JavaScript origins
6. Agrega la URL
7. Espera 5-10 minutos
8. Recarga la página
```

---

### Mercado Pago Error 404
```
❌ Ves: "404 (Not Found)" o "your_public_key_here"

✅ Solución:
1. Ve a https://www.mercadopago.com.ar/developers/panel/app
2. Copia "Public Key"
3. Abre .env
4. Busca: VITE_MERCADOPAGO_PUBLIC_KEY=your_public_key_here
5. Reemplaza con tu Public Key real
6. Guarda archivo (Ctrl+S)
7. Reinicia servidor (Ctrl+C, npm run dev)
8. Recarga navegador
```

---

## Variables de Entorno Necesarias

```env
# .env
VITE_GOOGLE_CLIENT_ID=tu_client_id_aqui
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-xxx o APP_USR-xxx
VITE_API_BASE_URL=http://localhost:5000
```

---

## Comandos Necesarios

```bash
# Reiniciar todo
npm install
npm run dev

# Ver si están configuradas
echo $VITE_GOOGLE_CLIENT_ID
echo $VITE_MERCADOPAGO_PUBLIC_KEY
```

---

## Si Aún Falla

1. **Abre F12**
2. **Busca logs rojo ❌**
3. **Lee solución azul 💡 abajo**
4. **Sigue pasos 1️⃣ 2️⃣ 3️⃣**

---

## Guías Completas

| Problema | Solución |
|----------|----------|
| Google 403 | [GOOGLE_OAUTH_DEBUG_GUIDE.md](GOOGLE_OAUTH_DEBUG_GUIDE.md) |
| MP 404 | [MERCADOPAGO_404_ERROR_FIX.md](MERCADOPAGO_404_ERROR_FIX.md) |
| MP Setup | [MERCADOPAGO_SETUP.md](MERCADOPAGO_SETUP.md) |
| Overview | [DEBUGGING_GUIDE_INDEX.md](DEBUGGING_GUIDE_INDEX.md) |

---

## Tarjetas Testing Mercado Pago

```
Número: 4509953566233576
Vencimiento: 11/25
CVC: 123
Nombre: APRO (para aprobado)
```

---

**¿Necesitas más detalles? Lee los documentos completos.**  
**¿Urgencia? Sigue los pasos de arriba (5 minutos).**
