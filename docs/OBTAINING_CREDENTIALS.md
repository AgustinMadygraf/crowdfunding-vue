# Obtención de Credenciales

Este documento proporciona instrucciones paso a paso para obtener todas las credenciales necesarias para configurar la aplicación de crowdfunding.

## 📋 Tabla de Contenidos

1. [Google OAuth (REQUERIDO)](#google-oauth)
2. [MercadoPago](#mercadopago)
3. [Chatwoot](#chatwoot)
4. [API Backend](#api-backend)
5. [Configuración Final](#configuración-final)

---

## Google OAuth

⚠️ **REQUERIDO**: Google OAuth es obligatorio para el sistema de autenticación. Los usuarios deben iniciar sesión con su cuenta de Google antes de realizar contribuciones.

### ¿Por qué Google OAuth?

- ✅ Autenticación segura sin gestionar contraseñas
- ✅ Información verificada del usuario (email, nombre, foto)
- ✅ Experiencia de usuario simplificada (un solo click)
- ✅ Soporte para múltiples contribuciones por usuario

### 1. Crear un Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Haz click en el selector de proyectos (arriba a la izquierda)
3. Selecciona **"New Project"** (Nuevo Proyecto)
4. Dale un nombre a tu proyecto (ej: "Crowdfunding App")
5. Selecciona la organización (si aplica)
6. Haz click en **"Create"** (Crear)

> 💡 **Tip**: Espera unos segundos mientras Google crea el proyecto

### 2. Habilitar Google Identity Services API

1. Con tu proyecto seleccionado, ve al menú lateral
2. Navega a **"APIs & Services" > "Library"**
3. Busca **"Google Identity Services"** o **"Google+ API"**
4. Haz click en la API y luego en **"Enable"** (Habilitar)

> ℹ️ **Nota**: La API de autenticación puede aparecer como "Google+ API" o simplemente activarse automáticamente

### 3. Configurar la Pantalla de Consentimiento OAuth

1. Ve a **"APIs & Services" > "OAuth consent screen"**
2. Selecciona el tipo de usuario:
   - **External**: Para cualquier usuario con cuenta de Google (RECOMENDADO)
   - **Internal**: Solo para usuarios de tu organización Google Workspace
3. Haz click en **"Create"** (Crear)

#### Configurar información de la app:

- **App name**: Nombre de tu aplicación (ej: "Crowdfunding Madygraf")
- **User support email**: Tu email de contacto
- **App logo**: (Opcional) Logo de tu aplicación
- **Application home page**: URL de tu sitio (ej: https://tudominio.com)
- **Application privacy policy link**: (Opcional pero recomendado)
- **Application terms of service link**: (Opcional)
- **Authorized domains**: Agrega tu dominio (ej: tudominio.com)
- **Developer contact information**: Tu email

4. Haz click en **"Save and Continue"** (Guardar y Continuar)

#### Configurar Scopes (Alcances):

1. En la sección "Scopes", haz click en **"Add or Remove Scopes"**
2. Selecciona estos scopes:
   - ✅ `userinfo.email` - Ver dirección de email
   - ✅ `userinfo.profile` - Ver información básica del perfil
   - ✅ `openid` - Autenticación OpenID
3. Haz click en **"Update"** y luego **"Save and Continue"**

#### Usuarios de prueba (solo si es External):

1. Si seleccionaste "External", agrega usuarios de prueba
2. Haz click en **"Add Users"**
3. Agrega los emails de las cuentas de Google que usarás para probar
4. Haz click en **"Save and Continue"**

> 🚨 **IMPORTANTE**: Mientras tu app esté en modo "Testing", solo los usuarios de prueba agregados podrán iniciar sesión. Para permitir cualquier usuario, debes publicar la app (ver abajo).

### 4. Crear Credenciales OAuth 2.0 (Client ID)

1. Ve a **"APIs & Services" > "Credentials"**
2. Haz click en **"Create Credentials"** (arriba)
3. Selecciona **"OAuth client ID"**
4. En "Application type", selecciona **"Web application"**

#### Configurar el Client ID:

**Name**: Dale un nombre (ej: "Crowdfunding Web Client")

**Authorized JavaScript origins**: Agrega las URLs desde donde se llamará la autenticación:
- Para desarrollo:
  ```
  http://localhost:5173
  http://localhost:3000
  http://127.0.0.1:5173
  ```
- Para producción:
  ```
  https://tudominio.com
  https://www.tudominio.com
  ```

**Authorized redirect URIs**: Agrega las URLs de redirección:
- Para desarrollo:
  ```
  http://localhost:5173
  http://localhost:5173/callback
  ```
- Para producción:
  ```
  https://tudominio.com
  https://tudominio.com/callback
  ```

5. Haz click en **"Create"** (Crear)

### 5. Copiar el Client ID

1. Después de crear, aparecerá un modal con tus credenciales
2. Copia el **"Client ID"** (formato: `xxxxx-xxxxxx.apps.googleusercontent.com`)
3. NO necesitas el "Client Secret" para autenticación frontend
4. Guarda el Client ID de forma segura

> 📋 **Client ID típico**: `123456789012-abc123def456ghi789jkl012mno345pq.apps.googleusercontent.com`

### 6. Publicar la App (Opcional - Para Producción)

Si quieres que cualquier usuario con cuenta de Google pueda autenticarse (no solo usuarios de prueba):

1. Ve a **"OAuth consent screen"**
2. En la sección "Publishing status", haz click en **"Publish App"**
3. Confirma que deseas publicar
4. Si tu app solicita scopes sensibles, Google puede requerir verificación (esto puede tomar días)

> ℹ️ Para scopes básicos (`email`, `profile`, `openid`), generalmente no se requiere verificación adicional.

### Estructura de Credenciales Google OAuth

```env
# Google OAuth Client ID
# Formato: xxxxx-xxxxxx.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID=123456789012-abc123def456ghi789jkl012mno345pq.apps.googleusercontent.com
```

### ✅ Verificar la Configuración

Después de configurar, verifica:

1. El archivo `.env` tiene el `VITE_GOOGLE_CLIENT_ID` configurado
2. Reinicia el servidor de desarrollo (`npm run dev`)
3. Deberías ver en la consola del navegador:
   ```
   [Auth] Google Client ID configurado correctamente
   [Auth] Google Identity Services SDK cargado exitosamente
   ```
4. El botón de Google aparece en el modal de autenticación
5. Al hacer click, se abre la ventana de selección de cuenta de Google

### 🐛 Solución de Problemas

Si ves errores, consulta: [GOOGLE_OAUTH_TROUBLESHOOTING.md](./GOOGLE_OAUTH_TROUBLESHOOTING.md)

Errores comunes:
- ❌ `Parameter client_id is not set correctly`: Client ID no configurado en `.env`
- ❌ `The given origin is not allowed`: Falta agregar la URL en "Authorized JavaScript origins"
- ❌ `Access blocked: This app's request is invalid`: La pantalla de consentimiento no está configurada correctamente

---

## Chatwoot

Chatwoot se utiliza para la comunicación con clientes a través de un widget de chat integrado.

### 1. Crear una Instancia de Chatwoot

Si no tienes una instancia de Chatwoot:
- Opción A: Aloja tu propia instancia en tu servidor
- Opción B: Usa Chatwoot Cloud (https://www.chatwoot.com)

### 2. Obtener el Token del Widget (VITE_CHATWOOT_TOKEN)

1. Accede a tu instancia de Chatwoot
2. Ve a **Settings (Configuración)**
3. Selecciona **Inboxes (Bandejas de Entrada)**
4. Abre tu inbox o crea uno nuevo
5. Ve a la pestaña **Settings** del inbox
6. En la sección **Integrations** o **Widget**, busca y copia el **Widget Token**

> **Nota**: El token es visible en el código de integración del widget

### 3. Obtener la URL Base de Chatwoot (VITE_CHATWOOT_BASE_URL)

- Si usas **Chatwoot Cloud**: `https://app.chatwoot.com`
- Si auto-hospedas: La URL de tu instancia (ej: `https://chatwoot.tudominio.com`)

### 4. Obtener el Identificador del Inbox (VITE_CHATWOOT_INBOX_IDENTIFIER)

1. En Chatwoot, ve a **Settings > Inboxes**
2. Abre el inbox que deseas usar
3. Ve a la pestaña **Settings** o **Details**
4. Busca el campo **Identifier** (generalmente algo como: `madygraf-crowdfunding`)
5. Copia este valor

### 5. Obtener el Token HMAC (VITE_CHATWOOT_HMAC_TOKEN) - Opcional pero Recomendado

1. Ve a **Settings > Account Settings**
2. Selecciona la pestaña **API**
3. Busca la sección **Authentication** o **HMAC**
4. Si `enforce_identity_validation` está habilitado, encontrarás el **HMAC Token**
5. Copia el token

> **Nota**: Esto es opcional pero recomendado para mayor seguridad. Permite validar la identidad del usuario.

### Estructura de Credenciales Chatwoot

```env
VITE_CHATWOOT_TOKEN=your_widget_token_here
VITE_CHATWOOT_BASE_URL=https://app.chatwoot.com
VITE_CHATWOOT_INBOX_IDENTIFIER=madygraf-crowdfunding
VITE_CHATWOOT_HMAC_TOKEN=your_hmac_token_here (opcional)
```

---

## MercadoPago

MercadoPago se utiliza para procesar pagos de contribuciones.

### 1. Crear una Cuenta en MercadoPago

1. Ve a https://www.mercadopago.com.ar (o tu país)
2. Crea una cuenta o inicia sesión
3. Completa el perfil de tu negocio/proyecto

### 2. Obtener las Credenciales de Desarrollador

1. Accede a tu cuenta de MercadoPago
2. Ve a **Configuración de cuenta**
3. Selecciona **Credenciales** (o **Desarrollador > Credenciales**)
4. Verás dos conjuntos de credenciales:
   - **Credenciales de PRUEBA** (para desarrollo/testing)
   - **Credenciales de PRODUCCIÓN** (para ambiente real)

### 3. Obtener la Clave Pública (VITE_MERCADOPAGO_PUBLIC_KEY)

#### Para Desarrollo (RECOMENDADO mientras pruebas):

1. En la sección de **Credenciales de PRUEBA**
2. Busca **Public Key** (Clave Pública)
3. Copia el valor que comienza con `TEST-` (ej: `TEST-xxxxxxxxxxxxxxxxxxxx`)

#### Para Producción:

1. En la sección de **Credenciales de PRODUCCIÓN**
2. Busca **Public Key** (Clave Pública)
3. Copia el valor que comienza con `APP_USR-` (ej: `APP_USR-xxxxxxxxxxxxxxxxxxxx`)

### Estructura de Credenciales MercadoPago

```env
# Para desarrollo/testing:
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-xxxxxxxxxxxxxxxxxxxx

# Para producción:
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxxxxxxxxxxxxxx
```

> ⚠️ **IMPORTANTE**: Nunca uses credenciales de producción en desarrollo. Siempre comienza con credenciales de prueba.

---

## API Backend

### VITE_API_BASE_URL

La URL base del API backend de tu aplicación Flask.

#### Para Desarrollo Local:

```env
VITE_API_BASE_URL=http://localhost:5000
```

#### Para Desarrollo Remoto (con ngrok):

1. Si tu backend está en otra máquina, puedes usar [ngrok](https://ngrok.com):
   ```bash
   ngrok http 5000
   ```
2. ngrok te proporcionará una URL como: `https://abc123def456.ngrok-free.app`
3. Usa esta URL en tu `.env`:
   ```env
   VITE_API_BASE_URL=https://abc123def456.ngrok-free.app
   ```

#### Para Producción:

```env
VITE_API_BASE_URL=https://api.tudominio.com
```

---

## Configuración Final

### 1. Crear archivo `.env`

Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

### 2. Editar `.env` con tus credenciales

```env
# ⚠️ REQUERIDO - Google OAuth
VITE_GOOGLE_CLIENT_ID=123456789012-abc123def456ghi789jkl012mno345pq.apps.googleusercontent.com

# Backend API
VITE_API_BASE_URL=http://localhost:5000

# MercadoPago
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-xxxxxxxxxxxxxxxxxxxxx

# Chatwoot (Opcional - para chat de soporte)
VITE_CHATWOOT_TOKEN=tu_widget_token
VITE_CHATWOOT_BASE_URL=https://app.chatwoot.com
VITE_CHATWOOT_INBOX_IDENTIFIER=tu_inbox_identifier
VITE_CHATWOOT_HMAC_TOKEN=tu_hmac_token
```

### 3. Verificar que funcionan las credenciales

Después de configurar, verifica que:

- [ ] El widget de Chatwoot aparece en la aplicación
- [ ] Los pagos con MercadoPago funcionan (usa tarjetas de prueba)
- [ ] La API backend responde correctamente

---

## 🧪 Tarjetas de Prueba para MercadoPago

Si usas credenciales de desarrollo, puedes usar estas tarjetas de prueba:

| Tipo | Número | Mes | Año | CVC |
|------|--------|-----|-----|-----|
| Visa | 4111 1111 1111 1111 | Cualquiera | Futuro | Cualquiera |
| Mastercard | 5555 5555 5555 4444 | Cualquiera | Futuro | Cualquiera |
| Rechazada | 4000 0000 0000 0002 | Cualquiera | Futuro | Cualquiera |

---

## 📝 Checklist de Configuración

### Requerido (Mínimo para funcionar):

- [ ] ✅ Proyecto en Google Cloud Console creado
- [ ] ✅ OAuth Consent Screen configurado
- [ ] ✅ Client ID de Google OAuth obtenido
- [ ] ✅ Authorized JavaScript origins configurados
- [ ] ✅ VITE_GOOGLE_CLIENT_ID en archivo `.env`
- [ ] ✅ Cuenta de MercadoPago creada
- [ ] ✅ Clave Pública de MercadoPago obtenida (TEST para desarrollo)
- [ ] ✅ VITE_MERCADOPAGO_PUBLIC_KEY en archivo `.env`
- [ ] ✅ API Backend disponible y accesible
- [ ] ✅ VITE_API_BASE_URL configurado

### Opcional (Para funcionalidades adicionales):

- [ ] Instancia de Chatwoot configurada
- [ ] Token del Widget de Chatwoot obtenido
- [ ] Identificador del Inbox obtenido
- [ ] URL Base de Chatwoot definida
- [ ] Credenciales de Chatwoot en archivo `.env`

### Verificación:

- [ ] Servidor de desarrollo reiniciado después de editar `.env`
- [ ] Botón de Google Sign-In aparece correctamente
- [ ] Autenticación con Google funciona
- [ ] Pagos con MercadoPago funcionales (tarjetas de prueba)
- [ ] Widget de Chatwoot funcional (si está configurado)

---

## ⚠️ Notas de Seguridad

### Google OAuth:

1. ✅ **SÍ es seguro** compartir el Client ID (es público por diseño)
2. 🚫 **NO expongas** el Client Secret (aunque no lo usamos en frontend)
3. ⚠️ Configura correctamente los "Authorized JavaScript origins" para prevenir uso no autorizado
4. 🔒 Mantén tu app en modo "Testing" durante desarrollo
5. 📝 Revisa la lista de usuarios de prueba regularmente

### General:

1. **Nunca** hagas commit del archivo `.env` a git (ya está en `.gitignore`)
2. **Nunca** compartas tus credenciales privadas de MercadoPago o Chatwoot
3. Usa credenciales de desarrollo/prueba (TEST-) mientras desarrollas
4. Rotación de credenciales: Si crees que se han comprometido, regenera inmediatamente
5. Para producción, almacena las credenciales en variables de entorno del servidor
6. Considera usar sistemas de gestión de secretos (ej: HashiCorp Vault, AWS Secrets Manager)
7. Habilita logs de auditoría en Google Cloud Console para monitorear uso del OAuth

---

## 📚 Ayuda Adicional

### Documentación Oficial:

- [Google Identity Services](https://developers.google.com/identity/gsi/web/guides/overview)
- [Google Cloud Console](https://console.cloud.google.com)
- [Documentación de MercadoPago](https://developers.mercadopago.com/)
- [Documentación de Chatwoot](https://www.chatwoot.com/docs/)

### Documentación del Proyecto:

- [Solución de Problemas - Google OAuth](./GOOGLE_OAUTH_TROUBLESHOOTING.md)
- [Arquitectura de Subscripciones](./SUBSCRIPTION_ARCHITECTURE.md)
- [Guía de Implementación Frontend](./FRONTEND_IMPLEMENTATION.md)
- [README Principal](../README.md)

### Contacto y Soporte:

Si tienes problemas con:
- **Google OAuth**: Revisa primero [GOOGLE_OAUTH_TROUBLESHOOTING.md](./GOOGLE_OAUTH_TROUBLESHOOTING.md)
- **MercadoPago**: Consulta los logs del navegador y la documentación oficial
- **Backend**: Verifica que el servidor esté corriendo y accesible
