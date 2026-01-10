# 🐛 Guía de Depuración - Google OAuth 403 Error

## ⚠️ El Error

```
Failed to load resource: the server responded with a status of 403
[GSI_LOGGER]: The given origin is not allowed for the given client ID.
```

**Significado**: Tu aplicación se está ejecutando desde una URL que **NO está autorizada** en Google Cloud Console.

---

## 🔍 Cómo Identificar tu URL Actual

### En la Consola del Navegador (F12)

Después de los cambios realizados, verás logs como:

```
[GoogleAuthButton] 🌐 Origen actual: http://localhost:5173
[GoogleAuthButton] 📍 URL completa: http://localhost:5173/
[GoogleAuthButton] ⚠️⚠️⚠️ ACCIÓN REQUERIDA: Agrega este origen a Google Cloud Console:
[GoogleAuthButton] 👉 http://localhost:5173
```

**Este es el origen que necesitas autorizar.**

---

## 🔧 Cómo Solucionar el Error 403

### Paso 1: Identifica tu Origen Actual
Abre la consola del navegador (F12) y busca:
```
[GoogleAuthButton] 🌐 Origen actual: [AQUI VERÁS TU URL]
```

**Ejemplo de orígenes válidos:**
- `http://localhost:5173` (desarrollo local)
- `http://localhost:3000` (puerto alternativo)
- `http://127.0.0.1:5173`
- `https://tudominio.com` (producción)
- `https://subdomain.tudominio.com` (subdominios)

### Paso 2: Agrega el Origen en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** → **Credentials**
4. Busca tu **OAuth 2.0 Client ID** (Web application)
5. Haz clic en el cliente para editarlo
6. En **Authorized JavaScript origins**, agrega:
   - Tu URL actual de desarrollo (ej: `http://localhost:5173`)
   - Tu URL de producción (ej: `https://tudominio.com`)

**IMPORTANTE**: Los orígenes deben incluir el protocolo (`http://` o `https://`) y el puerto.

---

## 📊 Matriz de URLs y Problemas

### URLs que NO son válidas (causarán error 403):

| URL | ❌ Problema |
|-----|-----------|
| `localhost:5173` | Falta protocolo `http://` |
| `5173` | URL incompleta |
| `http://localhost` | Falta puerto |
| `https://localhost:5173` | En desarrollo, usa `http://` |
| `192.168.1.100:5173` | Sin protocolo |

### URLs que SÍ son válidas:

| URL | ✅ Válido |
|-----|---------|
| `http://localhost:5173` | ✅ Desarrollo local |
| `http://127.0.0.1:5173` | ✅ Loopback |
| `https://tudominio.com` | ✅ Producción con HTTPS |
| `http://tudominio.com` | ✅ Producción con HTTP |
| `https://app.tudominio.com` | ✅ Subdominios |

---

## 🎯 Logs Mejorados para Depuración

Con los cambios realizados, verás logs mucho más detallados:

### Información de Origen

```javascript
[GoogleAuthButton] 🌐 Origen actual: http://localhost:5173
[GoogleAuthButton] 📍 URL completa: http://localhost:5173/
[Auth] 🌐 Iniciando Google Sign-In desde origen: http://localhost:5173
```

### Si hay Error 403

```javascript
[Auth] ❌ Error en Google Sign-In initialization
[Auth] 🌐 Origen: http://localhost:5173
[Auth] Posibles causas:
  1️⃣ El origen NO está en "Authorized JavaScript origins"
  2️⃣ El Client ID es incorrecto
  3️⃣ Restricciones de dominio en Google Cloud
[Auth] 💡 Solución: Ve a https://console.cloud.google.com/
[Auth] 💡 Credenciales > OAuth 2.0 Client ID > Authorized JavaScript origins
[Auth] 💡 Agrega: http://localhost:5173
```

### Si hay Error de Conexión al Servidor

```javascript
[Auth] ❌ Error de conexión al servidor: No se pudo conectar a http://localhost:5000/api/auth/google
[Auth] 🌐 URL del servidor: http://localhost:5000
[Auth] Posibles causas:
  1️⃣ Servidor no está ejecutándose
  2️⃣ URL del servidor es incorrecta
  3️⃣ Problemas de conexión de red
  4️⃣ CORS no está configurado en el servidor
```

---

## 🚀 Flujo Completo de Depuración

### 1. Abre la Consola del Navegador
```
F12 → Console
```

### 2. Busca el Origen Actual
Filtra por `[GoogleAuthButton]` y encuentra:
```
🌐 Origen actual: [AQUI ESTÁ]
```

### 3. Verifica que Google SDK se Cargó
Deberías ver:
```
✅ Google Identity Services SDK cargado exitosamente
✅ Google SDK listo en intento X
```

Si no ves esto, Google Identity Services no se cargó.

### 4. Verifica Inicialización de Google Sign-In
Busca:
```
✅ Google Sign-In inicializado correctamente
```

Si ves error 403:
```
❌ Error en Google Sign-In initialization
💡 El origen NO está en "Authorized JavaScript origins"
💡 Agrega: [tu_origen]
```

### 5. Copia el Origen en Google Cloud Console
- Ve a Google Cloud Console
- Agrega tu origen exactamente como aparece en los logs
- Guarda los cambios
- **Espera 5-10 minutos** (Google necesita propagar los cambios)
- Recarga la página del navegador

---

## 📝 Variables de Entorno

Verifica que tu archivo `.env` está correctamente configurado:

```env
# .env (en la raíz del proyecto)

# Google OAuth
VITE_GOOGLE_CLIENT_ID=995644823822-6215fe0itfvrop0qs0oa0ouhplub5qc8.apps.googleusercontent.com

# Backend API
VITE_API_BASE_URL=http://localhost:5000
```

---

## 🔍 Errores Comunes y Soluciones

### Error: "The given origin is not allowed"
```
❌ Causa: El origen no está en Google Cloud Console
✅ Solución: Agrega el origen en "Authorized JavaScript origins"
```

### Error: "Google Identity Services SDK no está cargado"
```
❌ Causa: No se pudo cargar https://accounts.google.com/gsi/client
✅ Solución:
  1. Verifica tu conexión a internet
  2. Verifica que no hay bloqueador de anuncios/scripts
  3. Recarga la página
```

### Error: "Cannot connect to http://localhost:5000"
```
❌ Causa: El servidor backend no está ejecutándose
✅ Solución:
  1. Verifica que el backend está iniciado
  2. Verifica que está en http://localhost:5000
  3. Verifica CORS en el backend
```

### Error: "VITE_GOOGLE_CLIENT_ID no está configurado"
```
❌ Causa: Falta archivo .env o variable mal nombrada
✅ Solución:
  1. Crea archivo .env en la raíz
  2. Agrega: VITE_GOOGLE_CLIENT_ID=tu_client_id
  3. Reinicia el servidor de desarrollo (npm run dev)
```

---

## 📱 Diferentes Orígenes por Entorno

### Desarrollo Local
```env
VITE_GOOGLE_CLIENT_ID=tu_client_id_desarrollo.apps.googleusercontent.com
VITE_API_BASE_URL=http://localhost:5000
# Origen: http://localhost:5173
```

### Staging/Testing
```env
VITE_GOOGLE_CLIENT_ID=tu_client_id_staging.apps.googleusercontent.com
VITE_API_BASE_URL=https://api.staging.tudominio.com
# Origen: https://staging.tudominio.com
```

### Producción
```env
VITE_GOOGLE_CLIENT_ID=tu_client_id_produccion.apps.googleusercontent.com
VITE_API_BASE_URL=https://api.tudominio.com
# Origen: https://tudominio.com
```

---

## 🎬 Cómo Verificar que Todo Funciona

### 1. Consola Limpia de Errores
Deberías ver:
```
✅ Google SDK listo
✅ Google Sign-In inicializado correctamente
✅ Botón de Google Sign-In renderizado exitosamente
```

### 2. Botón de Google Visible
El botón de Google debe ser visible sin errores de red.

### 3. Click en Botón
Cuando hagas clic, debe:
```
✅ Usuario autenticado con Google
✅ Procesando credential...
✅ Autenticación exitosa
```

---

## 💡 Consejos Adicionales

1. **Borra la caché del navegador** entre cambios (Ctrl+Shift+Delete)
2. **Espera 5-10 minutos** después de cambios en Google Cloud Console
3. **Usa incógnito** para evitar problemas de caché
4. **Revisa F12 → Network** para ver todas las peticiones HTTP
5. **Prueba en otro puerto** si tienes conflictos:
   ```bash
   npm run dev -- --port 3000
   # Luego agrega http://localhost:3000 en Google Cloud Console
   ```

---

## 📞 Soporte

Si aún tienes problemas:

1. **Copia toda la consola** (F12 → Console → click derecho → Save as)
2. **Incluye:**
   - Tu origen actual (`http://localhost:5173` o similar)
   - Los Client IDs configurados en Google Cloud
   - Los orígenes autorizados en Google Cloud
   - La URL exacta donde está alojada la app
3. **Abre un issue** con esta información

---

## 📚 Referencias Útiles

- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Sign-In Documentation](https://developers.google.com/identity/gsi/web)
- [CORS en Google](https://developers.google.com/identity/gsi/web/guides/get-google-account-on-your-website)

---

**Última actualización**: Enero 2026
**Mejora realizada**: Logs detallados con emojis y stack traces completos
