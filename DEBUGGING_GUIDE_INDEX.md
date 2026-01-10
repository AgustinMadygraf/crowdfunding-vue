# 📚 Índice de Documentación de Debugging

## 🎯 Guías Principales

Hemos creado **4 documentos detallados** para ayudarte a resolver problemas:

### 1. 🌐 **[GOOGLE_OAUTH_DEBUG_GUIDE.md](GOOGLE_OAUTH_DEBUG_GUIDE.md)**
**Tema**: Configuración y debugging de Google Sign-In

**Cubre:**
- ✅ Entender el error 403 "origin not allowed"
- ✅ Cómo identificar tu origen actual (`http://localhost:5173`)
- ✅ Pasos para agregar origen en Google Cloud Console
- ✅ Soluciones para diferentes orígenes (desarrollo, staging, producción)
- ✅ Matriz de URLs válidas vs inválidas
- ✅ Casos de uso y flujo completo

**Cuándo usarla:**
- ❌ Ves error 403 en Google Sign-In
- ❌ El botón de Google no funciona
- ❌ "The given origin is not allowed"
- ✅ Necesitas agregar tu URL a Google Cloud Console

---

### 2. 💳 **[MERCADOPAGO_SETUP.md](MERCADOPAGO_SETUP.md)**
**Tema**: Configuración completa de Mercado Pago

**Cubre:**
- ✅ Cómo obtener Public Key de Mercado Pago
- ✅ Configurar `.env` correctamente
- ✅ Tarjetas de prueba para testing
- ✅ Flujo completo de pago
- ✅ Errores comunes y soluciones
- ✅ Tips de debugging avanzado

**Cuándo usarla:**
- 🔴 Tienes error "your_public_key_here"
- 🔴 Error 404 en payment_methods
- 🔴 "SDK not initialized"
- ✅ Necesitas configurar pagos
- ✅ Quieres probar con tarjetas de testing

---

### 3. 🔴 **[MERCADOPAGO_404_ERROR_FIX.md](MERCADOPAGO_404_ERROR_FIX.md)**
**Tema**: Solución específica para error 404

**Cubre:**
- ✅ Análisis detallado del error 404
- ✅ Por qué ocurre exactamente
- ✅ Pasos concretos para arreglarlo
- ✅ Comparación antes vs después
- ✅ Debugging avanzado con Network tab
- ✅ Checklist final

**Cuándo usarla:**
- 🔴 Ves exactamente: "404 (Not Found)" en Mercado Pago
- 🔴 "Uncaught (in promise) #<Object>"
- ✅ Tienes la clave de Mercado Pago pero aún falla

---

### 4. 📊 **[DEBUG_SUMMARY.md](DEBUG_SUMMARY.md)**
**Tema**: Resumen general de todas las mejoras

**Cubre:**
- ✅ Qué se mejoró en Google OAuth
- ✅ Qué se mejoró en Mercado Pago
- ✅ Matriz de emojis de debugging
- ✅ Flujo completo de contribución
- ✅ Antes vs Después comparación

**Cuándo usarla:**
- 📖 Necesitas una visión general
- 📖 Quieres entender todas las mejoras
- 📖 Estás documentando el proyecto

---

## 🚀 Cómo Usar Estas Guías

### Flujo de Resolución Recomendado

```
1. ¿Viste error en Google Sign-In? (403)
   └─ Ve a: GOOGLE_OAUTH_DEBUG_GUIDE.md

2. ¿Viste error en Mercado Pago? (404 o 503)
   └─ Primero: MERCADOPAGO_404_ERROR_FIX.md (análisis rápido)
   └─ Luego: MERCADOPAGO_SETUP.md (configuración completa)

3. ¿Necesitas visión general?
   └─ Ve a: DEBUG_SUMMARY.md

4. ¿Quieres todo en un lugar?
   └─ Ve a: Este archivo (README.md)
```

---

## 🛠️ Archivos Modificados

### Google OAuth
```
src/components/auth/
├── GoogleAuthButton.vue ✅ MEJORADO
   - Logging detallado del origen
   - Stack traces completos
   - Emojis visuales

src/infrastructure/services/
├── authService.ts ✅ MEJORADO
   - Try-catch robusto
   - URLs y endpoints visibles
   - Soluciones en logs
```

### Mercado Pago
```
src/infrastructure/
├── mercadopagoService.ts ✅ MEJORADO
   - Validación de Public Key
   - Detección de placeholders
   - Logging de cada paso

src/views/
├── SubscribeView.vue ✅ MEJORADO
   - Logs de creación de contribución
   - Información de usuario visible
   - Manejo de errores mejorado
```

---

## 📋 Símbolos y Significados

Todas las guías usan estos emojis consistentemente:

| Símbolo | Significado |
|---------|------------|
| ✅ | Éxito, algo funciona |
| ❌ | Error, algo falló |
| ⚠️ | Advertencia importante |
| 🌐 | URL, origen, servidor |
| 📍 | Ubicación específica |
| 📝 | Configuración |
| 💡 | Consejo, solución |
| 🔴 | Error crítico |
| 🟢 | Correcto |
| 🟡 | Atención |

---

## 🔍 Problemas Comunes Rápidos

### "The given origin is not allowed for the given client ID"
→ Ve a: **[GOOGLE_OAUTH_DEBUG_GUIDE.md](GOOGLE_OAUTH_DEBUG_GUIDE.md)** - Sección "Error 403"

### "404 (Not Found)" en payment_methods
→ Ve a: **[MERCADOPAGO_404_ERROR_FIX.md](MERCADOPAGO_404_ERROR_FIX.md)** - Paso 1

### "Public key not configured"
→ Ve a: **[MERCADOPAGO_SETUP.md](MERCADOPAGO_SETUP.md)** - Paso 1 y 2

### "SDK not initialized"
→ Ve a: **[MERCADOPAGO_SETUP.md](MERCADOPAGO_SETUP.md)** - Sección "Errores Comunes"

### "Uncaught (in promise) #<Object>"
→ Ve a: **[MERCADOPAGO_404_ERROR_FIX.md](MERCADOPAGO_404_ERROR_FIX.md)** - Sección "Otros Errores"

---

## 📚 Información Estructurada

### Variables de Entorno Necesarias

```env
# Google OAuth (OBLIGATORIO)
VITE_GOOGLE_CLIENT_ID=995644823822-6215fe0itfvrop0qs0oa0ouhplub5qc8.apps.googleusercontent.com

# Mercado Pago (OBLIGATORIO para pagos)
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-abc1234def5678...  # O APP_USR-... para producción

# Backend API
VITE_API_BASE_URL=http://localhost:5000

# Chatwoot (Opcional)
VITE_CHATWOOT_TOKEN=...
VITE_CHATWOOT_BASE_URL=...
```

### URLs Importantes

| Servicio | URL |
|----------|-----|
| Google Cloud Console | https://console.cloud.google.com/ |
| Mercado Pago Developers | https://www.mercadopago.com.ar/developers/panel/app |
| Chatwoot | https://chatwoot.madygraf.com |
| Tu Aplicación (Dev) | http://localhost:5173 |
| Tu Backend (Dev) | http://localhost:5000 |

---

## ✨ Mejoras Realizadas

### Logging
- ❌ Antes: Mensajes genéricos sin contexto
- ✅ Después: Detalles completos con emojis

### Try-Catch
- ❌ Antes: Mínimo manejo de errores
- ✅ Después: Robusto en toda la cadena

### Información Visible
- ❌ Antes: URLs, orígenes y claves ocultas
- ✅ Después: Todo visible para debugging

### Soluciones
- ❌ Antes: Errores sin indicar cómo resolver
- ✅ Después: Cada error tiene pasos para resolver

---

## 🎯 Flujo de Contribución Completo

```
USUARIO ACCEDE A /SUSCRIBIR
       ↓
[onMounted] Carga usuario + inicializa MercadoPago
       ↓
[GoogleAuthButton] Si no autenticado, muestra botón
       ↓
USUARIO CLICKS "CONTINUAR A PAGO"
       ↓
[handleSubmit] Crea contribución en backend
       ↓
[createContribution] POST /api/contributions
       ↓
USUARIO VE RESUMEN Y CLICKS PAGAR
       ↓
[handlePayment] Router push a /subscribe/{token}
       ↓
[SubscribePaymentView] initMercadoPago()
       ↓
[initiatePayment] createPaymentPreference()
       ↓
[openCheckout] Modal de Mercado Pago abre
       ↓
USUARIO COMPLETA PAGO
       ↓
REDIRECT A success/failure/pending URL
       ↓
[getPaymentStatusFromUrl] Procesa resultado
```

---

## 🚨 Si Aún Tienes Problemas

### Paso 1: Abre la Consola
```
F12 → Console
```

### Paso 2: Busca el Error
Filtra por `[GoogleAuthButton]` o `[MercadoPago]`

### Paso 3: Lee el Símbolo
- ❌ Rojo = Error crítico
- 💡 Azul = Consejo/solución

### Paso 4: Sigue los Pasos
Los logs ahora te dicen exactamente qué hacer

### Paso 5: Consulta las Guías
Busca el error específico en los documentos

---

## 📞 Resumen de Soporte

| Documento | Para Qué | Tiempo |
|-----------|----------|--------|
| GOOGLE_OAUTH_DEBUG_GUIDE.md | Google Sign-In | 10 min |
| MERCADOPAGO_SETUP.md | Setup Mercado Pago | 15 min |
| MERCADOPAGO_404_ERROR_FIX.md | Error 404 específico | 5 min |
| DEBUG_SUMMARY.md | Visión general | 3 min |

---

## ✅ Checklist de Configuración

### Google OAuth
- [ ] Agregué `http://localhost:5173` en Google Cloud Console
- [ ] Esperé 5-10 minutos
- [ ] Recargué la página
- [ ] Vi ✅ en console

### Mercado Pago
- [ ] Obtuve Public Key de Mercado Pago
- [ ] Actualicé `.env` (no `your_public_key_here`)
- [ ] Reinicié servidor
- [ ] Vi ✅ en console

### Testing
- [ ] Probé Google Sign-In
- [ ] Probé crear contribución
- [ ] Probé abrir Mercado Pago

---

## 📌 Comandos Útiles

```bash
# Reiniciar servidor
npm run dev

# Borrar caché y reinstalar
npm install

# Ver versión de Node
node --version

# Ver variables de entorno (verificar .env se cargó)
echo $VITE_GOOGLE_CLIENT_ID
```

---

## 🎓 Aprendiste

- ✅ Cómo leer logs detallados
- ✅ Cómo interpretar emojis de debugging
- ✅ Cómo configurar Google OAuth
- ✅ Cómo configurar Mercado Pago
- ✅ Cómo resolver errores comunes
- ✅ Cómo debuggear flujos complejos

---

## 📈 Siguiente Paso

Una vez todo funciona:
1. Prueba el flujo completo de contribución
2. Prueba con una tarjeta de testing
3. Verifica que los logs muestren ✅
4. Informa si necesitas más ayuda

---

**Última actualización**: Enero 10, 2026  
**Documentos**: 4 archivos completos  
**Estado**: ✅ Listo para usar
