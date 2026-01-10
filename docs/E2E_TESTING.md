# Testing E2E - Madypack Portal

**Fecha:** 2026-01-10  
**Versión:** v1.0 Pre-Deploy  
**Objetivo:** Validar funcionalidad completa antes de despliegue a producción

---

## 🎯 Checklist de Testing

### 1. Navegación y Rutas ✅/❌

#### 1.1 Páginas Principales
- [ ] `/` (Home) carga correctamente
- [ ] `/etapas` muestra 6 etapas con progreso
- [ ] `/etapas/:id` (ej. /etapas/1) muestra detalle completo
- [ ] `/actualizaciones` muestra 8 updates con filtros
- [ ] `/documentos` carga sin errores
 - [ ] `/subscribe` muestra selector de niveles y botón Google
- [ ] `404` para rutas inexistentes

#### 1.2 Navegación Interna
 - [ ] Click en "Suscribirse" (Hero) → redirige a `/subscribe`
- [ ] Click en etapa → abre modal de detalle
- [ ] Click en "Ver más" (modal) → redirige a `/etapas/:id`
- [ ] Header links funcionan (logo → home, nav items)
- [ ] Footer links funcionan
- [ ] Botón "Volver" en páginas de detalle

#### 1.3 Scroll Behavior
- [ ] Scroll to top en cambio de ruta
- [ ] Anchors internos (ej. `#etapas`) funcionan
- [ ] Scroll smooth en navegación

---

### 2. Autenticación y Contribución ✅/❌

#### 2.1 Google Auth
- [ ] Botón Google renderiza sin errores
- [ ] Login con Google funciona (popup)
- [ ] Estado autenticado persiste en localStorage

#### 2.2 Crear Contribución
- [ ] Selección de nivel habilita "Continuar al pago"
- [ ] POST `/api/contributions` retorna `token` y `preference_id`
- [ ] Redirige a `/subscribe/:token` correctamente
- [ ] Errores de red/servidor muestran feedback al usuario

---

### 3. Componentes y UI ✅/❌

#### 3.1 MilestoneCard
- [ ] Muestra 6 etapas en grid
- [ ] Progress bar refleja % correcto
- [ ] Hover effect funciona
- [ ] Click abre modal
- [ ] Estado "completado" se visualiza diferente

#### 3.2 MilestoneDetailModal
- [ ] Modal abre con animación
- [ ] Muestra toda la info: descripción, timeline, evidencias
- [ ] Botón "Ver más" redirige correctamente
- [ ] Botón X cierra modal
- [ ] Click fuera del modal lo cierra
- [ ] Scroll dentro del modal funciona

#### 3.3 UpdateCard
- [ ] 8 updates se muestran en grid
- [ ] Badge de categoría tiene color correcto
- [ ] Fecha formateada correctamente
- [ ] Click abre modal con contenido completo
- [ ] Filtros por categoría funcionan

#### 3.4 Filtros de Updates
- [ ] "Todas" muestra 8 updates
- [ ] "Comercial" filtra correctamente
- [ ] "Técnico" filtra correctamente
- [ ] "Logística" filtra correctamente
- [ ] "Legal" filtra correctamente
- [ ] Contador de resultados es correcto

---

### 4. Responsive Design ✅/❌

#### 4.1 Mobile (< 768px)
- [ ] Header colapsa correctamente
- [ ] Grid de etapas: 1 columna
- [ ] Grid de updates: 1 columna
- [ ] Modal responsive (no overflow)
- [ ] Botones táctiles suficientemente grandes

#### 4.2 Tablet (768px - 1024px)
- [ ] Grid de etapas: 2 columnas
- [ ] Grid de updates: 2 columnas
- [ ] Container adapta ancho

#### 4.3 Desktop (> 1024px)
- [ ] Grid de etapas: 3 columnas
- [ ] Grid de updates: 3 columnas
- [ ] Container max-width 1200px
- [ ] Márgenes correctos

---

### 5. SEO y Meta Tags ✅/❌

#### 5.1 Meta Tags Dinámicos
- [ ] Home: title "Madypack - Portal Proyecto RKHA190"
- [ ] /etapas: title "Etapas del Proyecto - Madypack"
- [ ] /actualizaciones: title "Actualizaciones - Madypack"
- [ ] Meta description cambia por ruta
- [ ] OpenGraph tags se actualizan dinámicamente

#### 5.2 Archivos SEO
- [ ] /sitemap.xml carga correctamente (XML válido)
- [ ] /robots.txt carga correctamente
- [ ] /favicon.ico existe y carga

#### 5.3 Compartir en Redes
- [ ] Preview de Facebook (usar debugger.facebook.com)
- [ ] Preview de Twitter (usar cards validator)
- [ ] WhatsApp muestra preview

---

### 6. Performance ✅/❌

#### 6.1 Lighthouse Scores (Dev Tools)
- [ ] Performance: > 90
- [ ] Accessibility: > 90
- [ ] Best Practices: > 90
- [ ] SEO: > 90

#### 6.2 Tiempos de Carga
- [ ] First Contentful Paint (FCP): < 1.8s
- [ ] Largest Contentful Paint (LCP): < 2.5s
- [ ] Time to Interactive (TTI): < 3.8s

#### 6.3 Bundle Size
- [ ] JS total (gzipped): ~40KB ✅ (verificado: 39.82KB)
- [ ] CSS total (gzipped): ~10KB ✅ (verificado: 7.78KB total)

---

### 7. Errores de Consola ✅/❌

#### 7.1 JavaScript
- [ ] 0 errores en consola (Home)
- [ ] 0 errores en consola (Etapas)
- [ ] 0 errores en consola (Actualizaciones)
- [ ] 0 warnings críticos

#### 7.2 Network
- [ ] Todos los assets cargan (200 OK)
- [ ] No hay 404s
- [ ] No hay CORS errors

---

### 8. Pago con MercadoPago ✅/❌

#### 8.1 Checkout
- [ ] Botón "Pagar con MercadoPago" visible
- [ ] Checkout Pro abre modal/redirect
- [ ] Tarjetas de prueba funcionan
- [ ] Estado de contribución actualiza tras webhook

---

### 9. Casos Edge ✅/❌

#### 9.1 Auth y Contribución
- [ ] Cancelar login Google → feedback amigable
- [ ] Token inválido en `/api/auth/google` → error manejado
- [ ] Error en `/api/contributions` → feedback y reintento
- [ ] Acceso a `/subscribe/:token` inválido → 404

#### 9.2 Navegación
- [ ] URL no válida → 404
- [ ] /etapas/999 (etapa inexistente) → error manejado
- [ ] Refresh en ruta dinámica funciona

#### 9.3 Performance
- [ ] Abrir 5 modales seguidos → no memory leak
- [ ] Scroll rápido en lista de updates → smooth
- [ ] Click múltiple en botón submit → solo 1 request

---

## 🔧 Comandos de Testing

### Servidor de Desarrollo
```bash
npm run dev
# Visitar: http://localhost:5173
```

### Build de Producción
```bash
npm run build
npm run preview
# Visitar: http://localhost:4173
```

### Lighthouse (Chrome DevTools)
1. Abrir DevTools (F12)
2. Tab "Lighthouse"
3. Categories: All
4. Mode: Navigation
5. Device: Desktop + Mobile
6. Click "Analyze page load"

### Test Manual de Pago
1. Autenticar con Google en `/subscribe`
2. Crear contribución y navegar a `/subscribe/:token`
3. Click "Pagar con MercadoPago" y completar con tarjeta de prueba
4. Verificar actualización de estado en la página

---

## 📝 Registro de Testing

### Testing Run #1 - [Fecha/Hora]
**Ejecutado por:** [Nombre]  
**Ambiente:** Dev / Production Preview  
**Browser:** Chrome/Firefox/Safari [Version]  
**Dispositivo:** Desktop / Mobile [Modelo]

| Categoría | Tests Pasados | Tests Fallados | Notas |
|-----------|---------------|----------------|-------|
| Navegación | 0/10 | 0 | - |
| Auth + Contribución | 0/8 | 0 | - |
| Componentes | 0/15 | 0 | - |
| Responsive | 0/10 | 0 | - |
| SEO | 0/8 | 0 | - |
| Performance | 0/6 | 0 | - |
| Consola | 0/5 | 0 | - |
| Edge Cases | 0/8 | 0 | - |

**TOTAL:** 0/78 tests ✅ | 0 ❌

---

## 🐛 Bugs Encontrados

### [ID] - [Título del Bug]
**Severidad:** Crítico / Alto / Medio / Bajo  
**Encontrado en:** [Componente/Página]  
**Pasos para reproducir:**
1. ...
2. ...

**Comportamiento esperado:** ...  
**Comportamiento actual:** ...  
**Screenshot/Video:** [link]  
**Status:** Pendiente / En progreso / Resuelto

---

## ✅ Criterios de Aceptación

Para considerar el testing E2E como **COMPLETADO**, deben cumplirse:

1. ✅ **90%+ de tests pasados** (mínimo 70/78)
2. ✅ **0 bugs críticos**
3. ✅ **Lighthouse Performance > 90** (desktop)
4. ✅ **Flujo Google Auth → Contribución → Pago funciona** 100%
5. ✅ **0 errores de consola** en happy path
6. ✅ **Responsive funciona** en mobile/tablet/desktop
7. ✅ **SEO tags validados** (OpenGraph + Twitter)

---

## 🚀 Próximos Pasos Post-Testing

Si testing pasa:
- ✅ Merge a main
- ✅ Deploy a producción (GitHub Actions)
- ✅ Testing E2E en producción

Si testing falla:
- ❌ Documentar bugs
- ❌ Priorizar fixes
- ❌ Re-test después de fixes
