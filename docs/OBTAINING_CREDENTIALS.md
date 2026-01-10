# Obtención de Credenciales

Este documento proporciona instrucciones paso a paso para obtener todas las credenciales necesarias para configurar la aplicación de crowdfunding.

## 📋 Tabla de Contenidos

1. [Chatwoot](#chatwoot)
2. [MercadoPago](#mercadopago)
3. [API Backend](#api-backend)
4. [Configuración Final](#configuración-final)

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
# Chatwoot
VITE_CHATWOOT_TOKEN=tu_widget_token
VITE_CHATWOOT_BASE_URL=https://app.chatwoot.com
VITE_CHATWOOT_INBOX_IDENTIFIER=tu_inbox_identifier
VITE_CHATWOOT_HMAC_TOKEN=tu_hmac_token (opcional)

# Backend API
VITE_API_BASE_URL=http://localhost:5000

# MercadoPago
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-xxxxxxxxxxxxxxxxxxxxx (desarrollo)
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

- [ ] Instancia de Chatwoot configurada
- [ ] Token del Widget de Chatwoot obtenido
- [ ] Identificador del Inbox obtenido
- [ ] URL Base de Chatwoot definida
- [ ] Cuenta de MercadoPago creada
- [ ] Clave Pública de MercadoPago obtenida
- [ ] API Backend disponible y accesible
- [ ] Archivo `.env` creado con todas las credenciales
- [ ] Widget de Chatwoot funcional
- [ ] Pagos con MercadoPago funcionales

---

## ⚠️ Notas de Seguridad

1. **Nunca** hagas commit del archivo `.env` a git (ya está en `.gitignore`)
2. **Nunca** compartas tus credenciales de producción
3. Usa credenciales de desarrollo/prueba mientras desarrollas
4. Rotación de credenciales: Si crees que se han comprometido, regenera inmediatamente
5. Para producción, almacena las credenciales en variables de entorno del servidor
6. Considera usar sistemas de gestión de secretos (ej: HashiCorp Vault, AWS Secrets Manager)

---

## Ayuda Adicional

- [Documentación de Chatwoot](https://www.chatwoot.com/docs/)
- [Documentación de MercadoPago](https://developers.mercadopago.com/)
- [Documentación del Proyecto](./README.md)
