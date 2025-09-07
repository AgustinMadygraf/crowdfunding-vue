# SRS — Especificación de Requisitos de Software (IEEE)  
**Proyecto:** Landing “Bono Fijo + Beneficio en Especie” — Campaña Crowdfunding RKH‑A190  
**Organización:** Cooperativa de Trabajo Madygraf  
**URL prevista:** https://madypack.com.ar/crowdfunding  
**Fecha:** 2025-09-07

---

## 1. Introducción

### 1.1 Propósito
Definir con precisión los requisitos funcionales y no funcionales de la **landing de crowdfunding** orientada a financiar la incorporación de la **RKH‑A190** mediante un **Bono Fijo con beneficio en especie**, integrando **Mercado Pago** y un **módulo de avances por hitos** con actualizaciones **quincenales**.

### 1.2 Alcance
- Única **landing** con embudo de conversión: visitante → selección de escalón → pago MP → confirmación (email/WhatsApp) → seguimiento de hitos.
- Público objetivo (**ICP #1**): **Compras/Marketing B2B** (clientes y prospectos de bolsas de papel en AMBA; cooperativas/ONGs afines).  
- Entregables de MVP: gestión de aportes por escalón, publicación de avances por hito, panel básico de métricas, FAQs y Términos.

### 1.3 Definiciones, siglas y acrónimos
- **ICP**: Ideal Customer Profile (perfil de cliente/aportante ideal).
- **MVP**: Minimum Viable Product.
- **MP**: Mercado Pago.
- **OEE**: Overall Equipment Effectiveness (Disponibilidad × Rendimiento × Calidad).

### 1.4 Referencias
- Informe preliminar de estructuración financiera para RKH‑A190 (Ingeniería y Planeamiento Industrial).  
- Políticas de privacidad vigentes y términos legales internos.  
- Estándar IEEE para SRS (IEEE 830 / prácticas actuales).

### 1.5 Visión general del documento
El documento cubre la descripción del producto, requisitos detallados (funcionales/no funcionales), modelos de datos, casos de uso, analítica, validación, riesgos y roadmap.

---

## 2. Descripción general

### 2.1 Perspectiva del producto
- **Front:** Landing pública (SEO/OG, responsive).  
- **Back (ligero):** Gestión de hitos, actualizaciones y métricas.  
- **Integraciones:** Mercado Pago (checkout), SMTP/Email, WhatsApp Business.  
- **Transparencia:** tablero incrustado o link a DataMaq con 2 métricas (Disponibilidad y Rendimiento).

### 2.2 Funciones principales del producto
1) Selección de escalón y pago con MP.  
2) Registro de lead y consentimiento.  
3) Panel de **progreso por hito** (% objetivo vs recaudado).  
4) **Actualizaciones quincenales** (texto/fotos/documentos).  
5) Panel básico de conversión (recaudado, #aportes, ticket promedio).

### 2.3 Características de usuarios
- **Aportante (B2B y comunidad):** ve info, elige escalón, paga, recibe comprobante y seguimiento.  
- **Admin/Comunicaciones:** carga/edita hitos, publica actualizaciones, descarga métricas.  
- **Consejo:** supervisa panel y aprobaciones clave.

### 2.4 Restricciones
- Cumplimiento de políticas de **Mercado Pago**.  
- **Wording legal**: bono con **beneficio en especie** (no promesa de renta financiera regulada); incluir **disclaimer**.  
- **Tiempo de salida**: Hito 1 en **21 días** desde lanzamiento.

### 2.5 Suposiciones y dependencias
- Presupuesto Sprint 1 ads: **ARS 150.000** (10 días).  
- Audiencia orgánica: **10.000 seguidores Instagram**.  
- Dominio activo: **madypack.com.ar/crowdfunding**.

---

## 3. Requisitos específicos

### 3.1 Requisitos funcionales (MVP)
- **F1. Registro de lead**: nombre, email, teléfono, organización, consentimiento.  
  - *CA1*: si falta consentimiento, no persiste.  
- **F2. Selector de escalón y modalidad**: “Bono Fijo + beneficio en especie” con tabla de escalones.  
  - *CA2*: cambio de escalón recalcula beneficio visible.  
- **F3. Pago Mercado Pago**: iniciar y confirmar pago por escalón.  
  - *CA3*: pago confirmado → estado “confirmado”, genera comprobante y dispara notificaciones.  
- **F4. Confirmaciones**: email y WhatsApp automáticos con comprobante/resumen.  
  - *CA4*: se envía dentro de 2 minutos posteriores al pago confirmado.  
- **F5. Progreso por hito**: visualizar metas, recaudado, % y fecha objetivo.  
  - *CA5*: actualización de recaudado impacta en tiempo real o <5 min.  
- **F6. Actualizaciones quincenales**: CRUD de posts con adjuntos (imágenes/PDF).  
  - *CA6*: post público ordenado por fecha y con hito asociado opcional.  
- **F7. Métricas de campaña**: recaudado total, número de aportes, ticket promedio, conversión (visitante→lead→aporte).  
  - *CA7*: exportación CSV básica.  
- **F8. FAQs y Términos (descargables)**: PDF/MD con políticas y disclaimers.  
  - *CA8*: enlace visible y descarga funcional.

### 3.2 Interfaz externa
- **Mercado Pago**: Checkout (pago único por escalón).  
- **Email**: SMTP o servicio externo (SendGrid/Mailgun).  
- **WhatsApp Business**: envío de confirmaciones y avisos “80%/100% de hito”.  
- **DataMaq** (opcional): embed o link a tablero.

### 3.3 Rendimiento
- **LCP < 2,5 s (móvil)**, TTI < 4 s en 4G.  
- Server p95 respuesta < 500 ms (vistas públicas).

### 3.4 Seguridad y privacidad
- HTTPS, CSP razonable, no guardar datos de tarjetas (todo en MP).  
- Mínimo almacenamiento de PII; encriptación en tránsito; backups diarios.  
- Cumplimiento de normativa de datos local aplicable (AR).

### 3.5 Atributos de calidad
- **Accesibilidad AA** (contraste, alt text, foco).  
- **Usabilidad**: jerarquía clara, CTA primario visible above the fold.  
- **Mantenibilidad**: separación de capas y componentes.

### 3.6 Analítica de eventos
Registrar: `view_hero`, `click_cta_primary`, `start_aporte`, `select_escalon`, `submit_lead_success`, `pago_iniciado`, `pago_confirmado`, `hito_view`, `faq_open`, `scroll_depth_75`, `share_whatsapp`.

### 3.7 Modelo de datos (conceptual)
- **Persona**{id, nombre, email, tel, org, consentimiento}  
- **Aporte**{id, persona_id, escalón, monto, medio_pago, estado, fecha}  
- **Hito**{id, nombre, objetivo_monto, recaudado, fecha_objetivo, estado}  
- **Actualización**{id, hito_id?, título, contenido, fecha, adjuntos}  
- **Beneficio**{id, escalón, tipo, descripción, condiciones}

### 3.8 Casos de uso (resumen)
- **CU1** Visitante elige escalón y paga con MP → recibe confirmación.  
- **CU2** Admin publica actualización quincenal con fotos y vincula hito.  
- **CU3** Consejo revisa panel y exporta métricas CSV.  
- **CU4** Sistema notifica por WhatsApp al alcanzar 80% y 100% de un hito.

### 3.9 Reglas de negocio (Bono Fijo + beneficio)
- **Escalones (ARS) y beneficio** *(transferible, canje por compra)*:  
  - 25k → **+6%** crédito de compra (12 meses)  
  - 50k → **+8%**  
  - 100k → **+10%**  
  - 250k → **+12%**  
  - 500k → **+14%**  
  - 1M → **+18%**  
- **Vigencia** del beneficio: 12 meses desde confirmación del aporte.  
- **Transferibilidad**: el crédito puede cederse a terceros (B2B).

### 3.10 SEO/OG/Schema
- Metadatos completos, OG Images, y **Schema.org** `DonateAction` y `Organization`.

---

## 4. Validación y QA

### 4.1 Criterios de aceptación (por requisito)
- **F1–F8** según CA1–CA8 anteriores.  
- **Medición**: eventos analíticos presentes y visibles en dashboard.  
- **SEO**: títulos/descr. únicos, OG correcto, sitemap generado.

### 4.2 Experimentos (10 días — Sprint 1)
- **A/B Titular**: (a) Impacto + Transparencia vs (b) Beneficio en especie.  
- **Test de ticket**: escalones visibles; analizar % selección y abandono.  
- **Retargeting**: activar a partir de día 3.  
- **Canales**: Meta/IG (60%), LinkedIn (20%), Search/Brand (10%), Retarget (10%).

### 4.3 Métricas de éxito
- Conversión a lead ≥ **5%**.  
- Confirmación de aporte sobre leads priorizados ≥ **40%**.  
- Ticket promedio ≥ **valor objetivo interno** (a definir).  
- **Go/No-Go** para escalar presupuesto y pasarela adicional si aplica.

---

## 5. Roadmap y hitos

### 5.1 Hitos financieros (fórmulas aprobadas)
- **M1 – Anticipo**: `0,30 × Costo_RKH_A190`  
- **M2 – Saldo embarque**: `0,70 × Costo_RKH_A190`  
- **Flete**: `0,05 × Costo_RKH_A190` *(estimación referencia)*  
- **Aduana/Impuestos**: `0,15 × Costo_RKH_A190`  
- **Montaje/PPM**: `0,06 × Costo_RKH_A190`  
- **Plan Comercial + mejoras**: `0,04 × Costo_RKH_A190`

### 5.2 Hito 1 (comunicacional)
- **Deadline:** 21 días post-lanzamiento para el objetivo de **M1 (30%)**.  
- **Ritmo de publicaciones:** quincenal + pushes en 80%/100% de cada hito.

---

## 6. Riesgos y mitigación

| Riesgo | Impacto | Prob. | Mitigación |
|---|---|---|---|
| Wording/Compliance | Alto | Medio | **Disclaimers** claros, revisión legal previa. |
| Volatilidad macro | Medio | Alto | Beneficio **en especie** (no renta cash); escalones flexibles. |
| Baja conversión B2B | Alto | Medio | Outreach directo + LinkedIn; retargeting; prueba social. |
| Retrasos logísticos | Medio | Medio | Comunicación por hitos; buffers y actualización de fechas. |
| Capacidad operativa de contenido | Medio | Medio | Calendario editorial y plantillas preaprobadas. |

---

## 7. Anexos

### A. Escalones y beneficios (detalle)
- 25k (+6%), 50k (+8%), 100k (+10%), 250k (+12%), 500k (+14%), 1M (+18%) — **vigencia 12 meses**, **transferible**.

### B. Glosario
- **Crédito de compra**: monto adicional en especie aplicable a productos/servicios de Madygraf.  
- **Hitos**: tramos financieros con objetivo y fecha meta.

### C. Plantillas de copy (extractos)
- **Titular A**: “Financiemos juntos la nueva capacidad productiva de Madygraf.”  
- **Sub**: “Tu aporte acelera la RKH‑A190. Seguís cada hito, ves el avance, recibís tu beneficio.”  
- **CTA**: “Quiero aportar”.

### D. Avisos legales (bosquejo)
- Este programa constituye un **crowdfunding productivo con beneficio en especie**. No representa oferta pública de valores ni asesoramiento financiero. El **beneficio es un crédito de compra** con vigencia y condiciones publicadas. Tratamiento de datos conforme normativa vigente.
