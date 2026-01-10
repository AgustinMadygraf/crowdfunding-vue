# Solución de Errores de Google OAuth

## Error: "Parameter client_id is not set correctly"

### Descripción del Error

Si ves este error en la consola del navegador:

```
accounts.google.com/gsi/button?...: Failed to load resource: the server responded with a status of 400 ()
[GSI_LOGGER]: Parameter client_id is not set correctly.
```

Esto significa que **el Client ID de Google OAuth no está configurado correctamente** en las variables de entorno.

### Solución Rápida

1. **Obtener el Google Client ID:**
   - Ve a [Google Cloud Console](https://console.cloud.google.com)
   - Crea o selecciona un proyecto
   - Navega a: **APIs & Services > Credentials**
   - Crea un "OAuth 2.0 Client ID" (tipo: Web application)
   - Configura los **Authorized JavaScript origins**:
     - http://localhost:5173 (desarrollo)
     - Tu dominio de producción
   - Configura los **Authorized redirect URIs**:
     - http://localhost:5173 (desarrollo)
     - Tu dominio de producción
   - Copia el **Client ID** (formato: `xxxxx-xxxxx.apps.googleusercontent.com`)

2. **Configurar en el archivo .env:**
   ```bash
   # Archivo: .env
   VITE_GOOGLE_CLIENT_ID=TU_CLIENT_ID_AQUI.apps.googleusercontent.com
   ```

3. **Reiniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

### Verificación

Después de configurar correctamente, deberías ver estos logs en la consola del navegador:

```
[Auth] Google Client ID configurado correctamente
[Auth] Google Identity Services SDK cargado exitosamente
[GoogleAuthButton] Configuración: { configured: true, clientIdPrefix: 'xxxxx...' }
[GoogleAuthButton] Google SDK listo, inicializando...
[Auth] Inicializando Google Sign-In...
[Auth] Botón de Google Sign-In renderizado exitosamente
```

### Errores Comunes

#### 1. Client ID vacío o con valor por defecto

**Síntoma:**
```
[Auth] VITE_GOOGLE_CLIENT_ID no está configurado en las variables de entorno
[Auth] Por favor, crea un archivo .env con VITE_GOOGLE_CLIENT_ID=tu_client_id
```

**Solución:** Verifica que el archivo `.env` tenga un valor válido (no `your_google_client_id.apps.googleusercontent.com`)

#### 2. Servidor no reiniciado después de cambiar .env

**Síntoma:** Los cambios en `.env` no se reflejan

**Solución:** 
- Detén el servidor (`Ctrl+C`)
- Reinicia: `npm run dev`
- Las variables de entorno solo se leen al iniciar Vite

#### 3. Origen no autorizado

**Síntoma:**
```
[GSI_LOGGER]: The given origin is not allowed for the given client ID
```

**Solución:** 
- Ve a Google Cloud Console
- En tu Client ID, agrega el origen actual en "Authorized JavaScript origins"
- Ejemplo: `http://localhost:5173`, `https://tudominio.com`

#### 4. SDK de Google no carga

**Síntoma:**
```
[GoogleAuthButton] Timeout esperando Google SDK
[GoogleAuthButton] Google Identity Services no se cargó en 10 segundos
```

**Solución:**
- Verifica tu conexión a internet
- Comprueba si hay bloqueadores de anuncios o extensiones que bloqueen `accounts.google.com`
- Revisa la consola del navegador para errores de red

### Logs de Diagnóstico

El sistema ahora incluye logs detallados en cada paso:

**Inicialización:**
```javascript
[Auth] Google Client ID configurado correctamente
[Auth] Google SDK script ya cargado
[Auth] No hay sesión previa almacenada
```

**Durante el login:**
```javascript
[GoogleAuthButton] Callback recibido de Google
[Auth] Usuario autenticado: usuario@ejemplo.com
[GoogleAuthButton] Autenticación exitosa: usuario@ejemplo.com
```

**Durante logout:**
```javascript
[GoogleAuthButton] Cerrando sesión
[Auth] Sesión cerrada
[GoogleAuthButton] Sesión cerrada exitosamente
```

### Testing

Para probar que todo funciona correctamente:

1. **Verifica la configuración:**
   ```javascript
   // En la consola del navegador
   authService.getConfigInfo()
   // Debería retornar: { configured: true, clientIdPrefix: "xxxxx..." }
   ```

2. **Verifica que el botón se renderice:**
   - El botón de Google debería aparecer en el modal de autenticación
   - No debería haber errores en la consola

3. **Prueba el flujo completo:**
   - Click en "Continuar con Google"
   - Selecciona tu cuenta de Google
   - Verifica que se muestre tu nombre y email
   - Verifica que se cree el token en localStorage

### Recursos Adicionales

- [Google Identity Services](https://developers.google.com/identity/gsi/web/guides/overview)
- [Obtener credenciales de Google](../../docs/OBTAINING_CREDENTIALS.md)
- [Guía de implementación frontend](../../docs/FRONTEND_IMPLEMENTATION.md)

### Soporte

Si sigues teniendo problemas:

1. Revisa los logs de la consola del navegador
2. Verifica que el archivo `.env` exista en la raíz del proyecto
3. Confirma que las variables empiecen con `VITE_` (requerido por Vite)
4. Asegúrate de haber reiniciado el servidor después de cambiar `.env`
