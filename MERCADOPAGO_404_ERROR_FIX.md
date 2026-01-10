# 🔴 Error Específico: Mercado Pago 404 y SDK Issues

## El Error que Viste

```
v2:1  GET https://api.mercadopago.com/v1/payment_methods/search?public_key=your_public_key_here&locale=es-AR...
404 (Not Found)

Uncaught (in promise) #<Object>
```

---

## 🔍 Análisis del Problema

### ¿Por qué ocurre?

El error ocurre en **3 etapas**:

**1. SDK se carga (✅ bien)**
```javascript
[MercadoPago] SDK initialized successfully
```

**2. Mercado Pago intenta buscar métodos de pago (❌ AQUÍ FALLA)**
```javascript
GET https://api.mercadopago.com/v1/payment_methods/search?public_key=your_public_key_here...
404 (Not Found)
```

**3. JavaScript tira un error no capturado (❌ AQUÍ EXPLOTA)**
```javascript
Uncaught (in promise) #<Object>
```

### ¿Cuál es la causa raíz?

**La Public Key es un PLACEHOLDER**: `your_public_key_here`

Mercado Pago API rechaza claves inválidas con HTTP 403 o 404.

---

## ✅ Cómo Arreglarlo

### Paso 1: Obtén tu Public Key Real

Ve a [https://www.mercadopago.com.ar/developers/panel/app](https://www.mercadopago.com.ar/developers/panel/app)

Debe lucir así:
- **Testing**: `TEST-ab1234cd5678ef1234ab1234cd5678`
- **Producción**: `APP_USR-1234567890-abcdefghij1234567890`

**NO** debe ser: `your_public_key_here` ❌

### Paso 2: Actualiza .env

```bash
# .env

# ANTES (❌ INCORRECTO)
VITE_MERCADOPAGO_PUBLIC_KEY=your_public_key_here

# DESPUÉS (✅ CORRECTO)
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-ab1234cd5678ef1234ab1234cd5678
```

### Paso 3: Reinicia el Servidor

```bash
# En la terminal
Ctrl+C  # Detén el servidor

npm run dev  # Inicia de nuevo
```

### Paso 4: Abre Navegador Incógnito

- Presiona **Ctrl+Shift+N** (o **Cmd+Shift+N** en Mac)
- Ve a [http://localhost:5173/suscribir](http://localhost:5173/suscribir)
- Abre **F12 → Console**
- Busca logs de `[MercadoPago]`

---

## 🔍 Qué Deberías Ver Después

### ✅ Correctamente Configurado

```javascript
[MercadoPago] 🔧 Iniciando configuración de Mercado Pago...
[MercadoPago] 🔑 Public Key: TEST-ab1234cd... ← ¡VES UNA CLAVE REAL!
[MercadoPago] 📥 Cargando SDK de Mercado Pago...
[MercadoPago] ✅ SDK cargado exitosamente
[MercadoPago] 🔐 Inicializando instancia de Mercado Pago...
[MercadoPago] ✅ SDK inicializado correctamente
[MercadoPago] 🌐 Locale: es-AR
```

### ❌ Incorrectamente Configurado

```javascript
[MercadoPago] 🔧 Iniciando configuración de Mercado Pago...
[MercadoPago] 🔑 Public Key: your_public_key_here ← ¡PLACEHOLDER!
[MercadoPago] ❌ VITE_MERCADOPAGO_PUBLIC_KEY es un placeholder
[MercadoPago] Valor actual: your_public_key_here
[MercadoPago] ⚠️ Clave no válida - reemplaza con tu Public Key real
[MercadoPago] Pagos deshabilitados
```

---

## 🛠️ Debugging Avanzado

### Si aún ves error 404

**1. Verifica Network Tab**
- F12 → Network
- Busca requests a `api.mercadopago.com`
- Verifica que `public_key` en URL **NO sea** `your_public_key_here`

**2. Borra Caché Completo**
```bash
# Opción 1: Incógnito (más rápido)
Ctrl+Shift+N

# Opción 2: Limpia manualmente
F12 → Application → Storage → Clear Site Data
```

**3. Verifica que realmente guardaste .env**
- Abre `.env` con editor de texto
- Verifica que tiene tu clave real
- **No** cierre sin guardar (Ctrl+S)

**4. Verifica que reiniciaste el servidor**
```bash
# Deberías ver al iniciar
[vite] v5.x.x building for production...
# O en dev mode
[vite] v5.x.x ready in xxx ms
```

---

## 📊 Comparación: Antes vs Después de la Mejora

### Antes de los cambios (Logs Básicos)

```javascript
mercadopagoService.ts:28 [MercadoPago] SDK initialized successfully
v2:1  GET https://api.mercadopago.com/v1/payment_methods/search?public_key=your_public_key_here...
404 (Not Found)
(anonymous) @ v2:1
Uncaught (in promise) #<Object>
```

**Problema**: No sabes qué está mal, error genérico sin detalles.

### Después de los cambios (Logs Mejorados)

```javascript
mercadopagoService.ts:15 [MercadoPago] 🔧 Iniciando configuración de Mercado Pago...
mercadopagoService.ts:16 [MercadoPago] 🔑 Public Key: your_public_key_here
mercadopagoService.ts:19 [MercadoPago] ❌ VITE_MERCADOPAGO_PUBLIC_KEY es un placeholder
mercadopagoService.ts:20 [MercadoPago] Valor actual: your_public_key_here
mercadopagoService.ts:21 [MercadoPago] ⚠️ Clave no válida - reemplaza con tu Public Key real
mercadopagoService.ts:22 [MercadoPago] 💡 Para testing: usa claves de prueba (TEST-...)
mercadopagoService.ts:23 [MercadoPago] Pagos deshabilitados hasta configurar esta clave
```

**Ventaja**: Sabes exactamente qué está mal y cómo arreglarlo.

---

## 🚨 Otros Errores Similares

### Error: "SDK not initialized"
```javascript
[MercadoPago] ❌ SDK de Mercado Pago no está inicializado
```

**Causas posibles:**
1. Public Key inválida
2. SDK no se cargó (sin conexión)
3. Librería no instalada

**Soluciones:**
1. Verifica Public Key (debe ser `TEST-` o `APP_USR-`)
2. Verifica conexión a internet
3. Ejecuta `npm install @mercadopago/sdk-js`

---

### Error: "Failed to create preference"
```javascript
[MercadoPago] ❌ Error al crear preferencia de pago
[MercadoPago] 📍 Endpoint: http://localhost:5000/api/payments/create
```

**Causa**: Backend no está ejecutándose o URL es incorrecta

**Soluciones:**
1. Verifica que el backend está corriendo
2. Verifica `VITE_API_BASE_URL` en `.env`

---

### Error: "Uncaught (in promise) #<Object>"
```javascript
Uncaught (in promise) #<Object>
```

**Causa**: Error sin capturar (genérico de SDK)

**Solución**: 
- Busca logs anteriores (probablemente `public_key`)
- Busca en la ventana anterior qué error ocurrió

---

## 🧪 Probando con Tarjetas de Testing

Una vez que tengas la Public Key configurada:

**Número de Tarjeta**: `4509953566233576`  
**Vencimiento**: `11/25`  
**CVC**: `123`  
**Nombre**: `APRO` (para que se apruebe)  

---

## 💡 Tips Finales

1. **Borra el archivo `.env.local`** si lo tienes
   - A veces Vite usa este archivo por defecto
   - Debería estar en `.env` normal

2. **Verifica que no hay espacios en la clave**
   - ❌ `VITE_MERCADOPAGO_PUBLIC_KEY = TEST-abc` (espacios)
   - ✅ `VITE_MERCADOPAGO_PUBLIC_KEY=TEST-abc` (sin espacios)

3. **El valor debe estar entre comillas o sin comillas, pero sin espacios**
   - ✅ `VITE_MERCADOPAGO_PUBLIC_KEY=TEST-abc`
   - ✅ `VITE_MERCADOPAGO_PUBLIC_KEY="TEST-abc"`
   - ❌ `VITE_MERCADOPAGO_PUBLIC_KEY = "TEST-abc"` (espacios)

4. **Si aún tiene `your_public_key_here`**
   - Abre `.env` con Notepad (no Word)
   - Busca con Ctrl+F la palabra
   - Reemplaza completamente

---

## ✅ Checklist Final

- [ ] Obtuve Public Key de Mercado Pago Developers
- [ ] Actualicé `.env` con la clave real (no `your_public_key_here`)
- [ ] Reinicié el servidor (`npm run dev`)
- [ ] Abrí en navegador incógnito
- [ ] Abrí F12 → Console
- [ ] Vi ✅ logs que dicen SDK inicializado
- [ ] NO vi ❌ "VITE_MERCADOPAGO_PUBLIC_KEY es un placeholder"
- [ ] Probé un pago de prueba (con tarjeta 4509...)

---

**Última actualización**: Enero 10, 2026  
**Documento**: Guía de resolución del error 404 de Mercado Pago
