/*
Path: src/infrastructure/mockData.ts

Este archivo YA está alineado al proyecto real (Madypack): incorporación de una
máquina de pegado automático de manijas GRANDES para bolsas de papel.

Notas importantes:
- Montos/fechas/URLs: dejé valores razonables como placeholders para que completes.
- El objetivo industrial (claridad) está en los "details" y en las evidencias sugeridas.
- KPI central: hoy la máquina confeccionadora de bolsas está en producción ~2,5% del tiempo calendario.
*/

import type { Milestone } from '@/domain/milestone';
import type { ContributionLevel } from '@/domain/contribution-level';
import type { Update } from '@/domain/update';

export const mockMilestones: Milestone[] = [
  {
    id: 1,
    name: 'Fortalecimiento comercial + línea base operativa',
    description:
      'Cerrar demanda y preparar el modelo operativo que libera horas de pegado manual y las convierte en más tiempo de máquina en producción.',
    details: `Propósito industrial
- El cuello de botella NO es confección de manijas (la máquina de manijas responde si se le exige).
- El cuello de botella ES el pegado MANUAL de manijas GRANDES.
- La nueva máquina automatiza el pegado de manijas GRANDES (manijas medianas/pequeñas seguirán con pegado manual).

KPI que queremos mover (base material del repago)
- Máquina confeccionadora de bolsas: ~44 bolsas/min cuando está en producción (máx anecdótico: 100 bolsas/min).
- Utilización/producción actual: ~2,5% del tiempo calendario (dato clave).
- Objetivo del proyecto: aumentar el tiempo operativo efectivo (más turnos / más horas productivas) al liberar horas de pegado manual de manija grande.

Modelo de cálculo (dejar armado para completar)
1) Relevar horas mensuales actuales:
   - H_bolsas_mes = horas/mes dedicadas a confección de bolsas
   - H_manijas_mes = horas/mes dedicadas a confección de manijas
   - H_pegado_grande_manual_mes = horas/mes dedicadas a pegado manual de manijas GRANDES
   - H_pegado_mediana_peq_manual_mes = horas/mes dedicadas a pegado manual manijas medianas/pequeñas (se mantiene)

2) Cambio con la nueva máquina:
   - H_pegado_grande_manual_mes se reduce y se reasigna a:
     a) más confección de bolsas
     b) más confección de manijas (si hiciera falta)
     c) operación de pegado automático (nueva máquina ~30–40 bolsas/min)

3) Resultado esperado:
   - ↑ disponibilidad/tiempo productivo real de la línea
   - ↑ producción y ventas de bolsas con manijas GRANDES
   - Base para devolver el préstamo (flujo incremental)

Entregables de esta etapa (evidencias públicas):
- Relevamiento de horas (planilla resumen)
- Proyección comercial (cartera/turnos/volúmenes) en versión pública
- Documento “criterios de avance” por etapa y qué evidencia se publica`,
    // TODO: completar moneda y monto real (ideal: USD o ARS + criterio de actualización)
    targetAmount: 0,
    raisedAmount: 0,
    // Proyecto 6 meses (desde enero 2026) → ajustar a tu cronograma real
    targetDate: '2026-02-05',
    status: 'active',
    responsible: 'Comercial + Producción',
    published: true,
    evidences: [
      {
        id: 101,
        title: 'Planilla de relevamiento de horas (versión pública)',
        type: 'document',
        url: 'https://proyecto.madypack.com.ar/docs/etapa-1/relevamiento-horas-v1.pdf',
        version: '1.0',
        publishedAt: '2026-01-10',
      },
      {
        id: 102,
        title: 'Modelo operativo: reasignación de horas y KPI 2,5% (versión pública)',
        type: 'document',
        url: 'https://proyecto.madypack.com.ar/docs/etapa-1/modelo-operativo-kpi-v1.pdf',
        version: '1.0',
        publishedAt: '2026-01-10',
      },
      {
        id: 103,
        title: 'Criterios de avance por etapa + política de evidencias',
        type: 'document',
        url: 'https://proyecto.madypack.com.ar/docs/etapa-1/criterios-avance-evidencias-v1.pdf',
        version: '1.0',
        publishedAt: '2026-01-10',
      },
    ],
    timeline: [
      {
        date: '2026-01-10',
        title: 'Definición del cuello de botella',
        description:
          'Se documenta que la restricción principal es el pegado manual de manijas GRANDES.',
        status: 'completed',
      },
      {
        date: '2026-01-20',
        title: 'Relevamiento de horas (baseline)',
        description:
          'Planilla de horas/mes por proceso: bolsas, manijas, pegado manual grande, pegado manual med/peq.',
        status: 'in-progress',
      },
      {
        date: '2026-02-05',
        title: 'Cierre de estrategia comercial + plan por turnos',
        description:
          'Se publican supuestos de demanda, plan de turnos y objetivos de disponibilidad para sostener el repago.',
        status: 'pending',
      },
    ],
  },
  {
    id: 2,
    name: 'Anticipo 30% máquina de pegado automático (manija grande)',
    description:
      'Pago de anticipo para iniciar fabricación/reserva de unidad de la máquina de pegado automático de manijas GRANDES.',
    details: `Qué se compra (describir con precisión técnica)
- Máquina: pegado automático de manijas GRANDES para bolsas de papel.
- Velocidad objetivo de operación: ~30–40 bolsas/min (según set-up / formato).
- Alcance: automatiza manija grande (mediana/pequeña sigue manual).

Criterio objetivo de etapa completada
- Orden de compra/contrato firmado (con datos sensibles omitidos en versión pública)
- Proforma Invoice / Invoice del proveedor
- Comprobante de pago del 30% (con datos sensibles ocultos)

Riesgos típicos y mitigación
- Riesgo: plazos del proveedor → Mitigación: contrato con hitos y penalidades/condiciones claras
- Riesgo: cambios de especificación → Mitigación: anexo técnico cerrado + aprobación interna`,
    // TODO: completar monto real (30% del valor total de máquina)
    targetAmount: 0,
    raisedAmount: 0,
    targetDate: '2026-02-20',
    status: 'pending',
    dependencies: [1],
    responsible: 'Compras + Finanzas',
    published: true,
    evidences: [
      {
        id: 201,
        title: 'Anexo técnico máquina pegado manija grande (versión pública)',
        type: 'document',
        url: 'https://proyecto.madypack.com.ar/docs/etapa-2/anexo-tecnico-v1.pdf',
        version: '1.0',
        publishedAt: '2026-01-25',
      },
      {
        id: 202,
        title: 'Proforma Invoice (datos sensibles omitidos)',
        type: 'document',
        url: 'https://proyecto.madypack.com.ar/docs/etapa-2/proforma-v1.pdf',
        version: '1.0',
        publishedAt: '2026-02-01',
      },
      {
        id: 203,
        title: 'Comprobante anticipo 30% (datos sensibles omitidos)',
        type: 'document',
        url: 'https://proyecto.madypack.com.ar/docs/etapa-2/pago-anticipo-30-v1.pdf',
        version: '1.0',
        publishedAt: '2026-02-20',
      },
    ],
    timeline: [
      {
        date: '2026-02-01',
        title: 'Contrato y proforma listos',
        description: 'Contrato con hitos + proforma emitida por proveedor.',
        status: 'pending',
      },
      {
        date: '2026-02-20',
        title: 'Pago anticipo 30%',
        description: 'Transferencia ejecutada y evidencia publicada (redactada).',
        status: 'pending',
      },
    ],
  },
  {
    id: 3,
    name: 'Saldo 70% máquina + inspección final (FAT)',
    description:
      'Pago del 70% restante antes del embarque y validación técnica final del equipo.',
    details: `Criterio objetivo de etapa completada
- Informe de inspección FAT (Factory Acceptance Test) o evidencia equivalente
- Packing List + documentación de embarque preparada
- Comprobante de pago del saldo 70% (redactado)

Riesgos típicos y mitigación
- Riesgo: diferencias entre especificación y máquina real → Mitigación: checklist FAT + evidencia fotográfica/video
- Riesgo: plazos de fabricación → Mitigación: seguimiento semanal + hitos contractuales`,
    // TODO: completar monto real (70% del valor total de máquina)
    targetAmount: 0,
    raisedAmount: 0,
    targetDate: '2026-03-20',
    status: 'pending',
    dependencies: [2],
    responsible: 'Técnica + Compras',
    published: true,
    evidences: [
      {
        id: 301,
        title: 'Checklist FAT + informe (versión pública)',
        type: 'document',
        url: 'https://proyecto.madypack.com.ar/docs/etapa-3/fat-informe-v1.pdf',
        version: '1.0',
        publishedAt: '2026-03-10',
      },
      {
        id: 302,
        title: 'Packing List / pre-embarque (datos sensibles omitidos)',
        type: 'document',
        url: 'https://proyecto.madypack.com.ar/docs/etapa-3/packing-list-v1.pdf',
        version: '1.0',
        publishedAt: '2026-03-15',
      },
      {
        id: 303,
        title: 'Comprobante pago saldo 70% (datos sensibles omitidos)',
        type: 'document',
        url: 'https://proyecto.madypack.com.ar/docs/etapa-3/pago-saldo-70-v1.pdf',
        version: '1.0',
        publishedAt: '2026-03-20',
      },
    ],
    timeline: [
      {
        date: '2026-03-10',
        title: 'Inspección FAT',
        description: 'Se valida funcionamiento y se documenta evidencia pública.',
        status: 'pending',
      },
      {
        date: '2026-03-20',
        title: 'Pago saldo 70%',
        description: 'Pago contra evidencia técnica y pre-embarque.',
        status: 'pending',
      },
    ],
  },
  {
    id: 4,
    name: 'Flete oceánico + seguro',
    description:
      'Contratación de transporte marítimo y seguro de carga hasta el puerto de destino.',
    details: `Criterio objetivo de etapa completada
- Booking confirmado
- Bill of Lading (BL) / documento de transporte (redactado)
- Póliza de seguro (redactada)

Riesgos y mitigación
- Riesgo: demora en tránsito / conexiones → Mitigación: forwarder con experiencia + buffer de cronograma
- Riesgo: daños de carga → Mitigación: embalaje + seguro cobertura adecuada`,
    // TODO: completar monto real de flete + seguro
    targetAmount: 0,
    raisedAmount: 0,
    targetDate: '2026-04-10',
    status: 'pending',
    dependencies: [3],
    responsible: 'Logística',
    published: true,
    evidences: [
      {
        id: 401,
        title: 'Booking / confirmación de embarque (redactado)',
        type: 'document',
        url: 'https://proyecto.madypack.com.ar/docs/etapa-4/booking-v1.pdf',
        version: '1.0',
        publishedAt: '2026-04-01',
      },
      {
        id: 402,
        title: 'Bill of Lading (BL) (datos sensibles omitidos)',
        type: 'document',
        url: 'https://proyecto.madypack.com.ar/docs/etapa-4/bl-v1.pdf',
        version: '1.0',
        publishedAt: '2026-04-10',
      },
      {
        id: 403,
        title: 'Póliza de seguro de carga (datos sensibles omitidos)',
        type: 'document',
        url: 'https://proyecto.madypack.com.ar/docs/etapa-4/seguro-carga-v1.pdf',
        version: '1.0',
        publishedAt: '2026-04-10',
      },
    ],
    timeline: [
      {
        date: '2026-04-01',
        title: 'Booking confirmado',
        description: 'Reserva de espacio y fecha de salida confirmadas.',
        status: 'pending',
      },
      {
        date: '2026-04-10',
        title: 'Documentación de transporte y seguro',
        description: 'BL y póliza publicados (redactados).',
        status: 'pending',
      },
    ],
  },
  {
    id: 5,
    name: 'Aduana + desaduanamiento',
    description:
      'Gestión aduanera, documentación y liberación de la máquina en el país.',
    details: `Criterio objetivo de etapa completada
- Documentación requerida completa (resumen público)
- Estado de despacho / liberación (resumen público)
- Comprobante de gastos/tasas clave (redactado)

Riesgos y mitigación
- Riesgo: demoras aduaneras → Mitigación: despachante con experiencia + documentación completa desde origen
- Riesgo: clasificación / costos inesperados → Mitigación: preclasificación + provisión de contingencia`,
    // TODO: completar monto real aduana + despachante + tasas
    targetAmount: 0,
    raisedAmount: 0,
    targetDate: '2026-05-05',
    status: 'pending',
    dependencies: [4],
    responsible: 'Comercio Exterior',
    published: true,
    evidences: [
      {
        id: 501,
        title: 'Checklist documentación aduanera (resumen público)',
        type: 'document',
        url: 'https://proyecto.madypack.com.ar/docs/etapa-5/checklist-aduana-v1.pdf',
        version: '1.0',
        publishedAt: '2026-04-20',
      },
      {
        id: 502,
        title: 'Estado de despacho / liberación (resumen público)',
        type: 'document',
        url: 'https://proyecto.madypack.com.ar/docs/etapa-5/estado-despacho-v1.pdf',
        version: '1.0',
        publishedAt: '2026-05-05',
      },
    ],
    timeline: [
      {
        date: '2026-04-20',
        title: 'Documentación lista para despacho',
        description: 'Resumen público de documentación y estado.',
        status: 'pending',
      },
      {
        date: '2026-05-05',
        title: 'Liberación aduanera',
        description: 'Se publica evidencia/resumen del libramiento.',
        status: 'pending',
      },
    ],
  },
  {
    id: 6,
    name: 'Instalación, montaje y puesta en marcha',
    description:
      'Montaje en planta, pruebas operativas, capacitación y arranque productivo del pegado automático de manija grande.',
    details: `Alcance industrial
- Instalación mecánica/eléctrica (y servicios industriales necesarios).
- Puesta en marcha con pruebas y parámetros base.
- Capacitación de operadores/mantenimiento.
- Primeras órdenes reales (cuando aplique).

Criterio objetivo de etapa completada
- Acta de instalación y puesta en marcha (resumen público)
- Evidencia de operación (video/fotos) y parámetros base
- Plan de mantenimiento preventivo + repuestos críticos (resumen público)

Riesgos y mitigación
- Riesgo: servicios industriales insuficientes → Mitigación: checklist de preinstalación y obra previa
- Riesgo: curva de aprendizaje → Mitigación: capacitación + SOP + acompañamiento inicial`,
    // TODO: completar monto real instalación/obra/servicios/capacitación
    targetAmount: 0,
    raisedAmount: 0,
    targetDate: '2026-06-10',
    status: 'pending',
    dependencies: [5],
    responsible: 'Producción + Mantenimiento',
    published: true,
    evidences: [
      {
        id: 601,
        title: 'Checklist de preinstalación (servicios industriales)',
        type: 'document',
        url: 'https://proyecto.madypack.com.ar/docs/etapa-6/preinstalacion-checklist-v1.pdf',
        version: '1.0',
        publishedAt: '2026-05-15',
      },
      {
        id: 602,
        title: 'Acta de puesta en marcha (resumen público)',
        type: 'document',
        url: 'https://proyecto.madypack.com.ar/docs/etapa-6/puesta-en-marcha-v1.pdf',
        version: '1.0',
        publishedAt: '2026-06-10',
      },
      {
        id: 603,
        title: 'SOP de operación + parámetros base (resumen público)',
        type: 'document',
        url: 'https://proyecto.madypack.com.ar/docs/etapa-6/sop-parametros-base-v1.pdf',
        version: '1.0',
        publishedAt: '2026-06-10',
      },
    ],
    timeline: [
      {
        date: '2026-05-15',
        title: 'Preinstalación',
        description: 'Checklist de servicios y preparación de área.',
        status: 'pending',
      },
      {
        date: '2026-06-10',
        title: 'Puesta en marcha',
        description: 'Pruebas, capacitación y arranque inicial.',
        status: 'pending',
      },
    ],
  },
];

export const mockContributionLevels: ContributionLevel[] = [
  /*
    Denominaciones sugeridas (preestablecidas).
    TODO: confirmar moneda/denominación final (ARS, USD o indexado).
    benefit: podés usarlo como “tasa/beneficio” o como “prioridad/información”; ajustalo a tu lógica real.
  */
  { amount: 50_000, benefit: 0, name: 'Aporte 50k' },
  { amount: 100_000, benefit: 0, name: 'Aporte 100k' },
  { amount: 250_000, benefit: 0, name: 'Aporte 250k' },
  { amount: 500_000, benefit: 0, name: 'Aporte 500k' },
  { amount: 1_000_000, benefit: 0, name: 'Aporte 1M' },
];

export const mockUpdates: Update[] = [
  {
    id: 1,
    category: 'comercial',
    title: 'Inicio del proyecto: automatizar el pegado de manijas GRANDES',
    excerpt:
      'El foco del proyecto es eliminar el cuello de botella del pegado manual de manijas grandes y aumentar el tiempo real de máquina en producción.',
    content: `Este proyecto incorpora una máquina de pegado automático de manijas GRANDES para bolsas de papel.

Hoy la restricción productiva no está en la confección de manijas (la máquina responde), sino en el pegado manual de manijas GRANDES, que consume horas críticas del proceso.

KPI base:
- Cuando la máquina de bolsas está produciendo, trabaja aprox. a 44 bolsas/min (máx anecdótico: 100 bolsas/min).
- Pero el dato clave es la utilización: sólo ~2,5% del tiempo calendario está en producción.

Con el pegado automático (30–40 bolsas/min), liberamos horas de pegado manual de manija grande y las reasignamos a más tiempo productivo de la línea, sosteniendo el flujo de ventas necesario para devolver el préstamo.

Publicaremos evidencias por etapa: documentos redactados (sin datos sensibles), checklist técnicos y avances verificables.`,
    status: 'published',
    publishedAt: '2026-01-10T12:00:00Z',
  },
  {
    id: 2,
    category: 'tecnico',
    title: 'KPI y modelo de cálculo: cómo convertir horas liberadas en más producción',
    excerpt:
      'Publicamos el modelo de relevamiento de horas y el mecanismo de reasignación que explica el aumento de disponibilidad.',
    content: `Publicamos el modelo base para entender el impacto real de la automatización.

Variables a relevar (mensuales):
- Horas dedicadas a confección de bolsas
- Horas dedicadas a confección de manijas
- Horas dedicadas a pegado manual de manija GRANDE
- Horas dedicadas a pegado manual de manija mediana/pequeña (se mantiene)

La nueva máquina reduce el tiempo de pegado manual de manija grande y permite reasignar esas horas a más producción, elevando el porcentaje de tiempo real en producción (hoy ~2,5% del tiempo calendario).`,
    status: 'published',
    publishedAt: '2026-01-12T12:00:00Z',
  },
  {
    id: 3,
    category: 'logistica',
    title: 'Plan de importación por etapas: pagos, flete, aduana y montaje',
    excerpt:
      'El proyecto se ejecuta en etapas para que los desembolsos se alineen a hitos verificables y a evidencias públicas.',
    content: `Estructuramos el plan en 6 etapas:
1) Fortalecimiento comercial + línea base operativa
2) Anticipo 30% máquina
3) Saldo 70% + inspección final (FAT)
4) Flete oceánico + seguro
5) Aduana + desaduanamiento
6) Instalación y puesta en marcha

Cada etapa tendrá criterio de avance y evidencias públicas (documentos redactados sin datos sensibles).`,
    status: 'published',
    publishedAt: '2026-01-15T12:00:00Z',
  },
  {
    id: 4,
    category: 'legal',
    title: 'Política de evidencias públicas: qué publicamos y qué datos se ocultan',
    excerpt:
      'Publicaremos comprobantes y documentación técnica redactada para transparencia sin exponer información sensible.',
    content: `Publicaremos evidencias por etapa (redactadas):
- Proformas, anexos técnicos, checklists FAT
- Documentos logísticos (BL/seguro) con datos sensibles omitidos
- Resúmenes de estado aduanero
- Actas de puesta en marcha y SOP de operación

No publicaremos datos sensibles (cuentas, datos personales, números completos de operación), pero sí evidencia suficiente para que el avance sea verificable.`,
    status: 'published',
    publishedAt: '2026-01-18T12:00:00Z',
  },
];
