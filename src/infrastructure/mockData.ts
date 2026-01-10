/**
 * GUÍA: Edición de Contenido para v1.0
 * 
 * v1.0 NO tiene backoffice admin. Para editar contenido del sitio, modifica este archivo directamente.
 * 
 * PASOS:
 * 1. Edita los datos abajo (mockMilestones, mockContributionLevels, etc.)
 * 2. Guarda los cambios
 * 3. Ejecuta: git add -A && git commit -m "Update: descripción del cambio"
 * 4. Ejecuta: git push main
 * 5. GitHub Actions redeploy automático en ~2 minutos
 * 6. Cambios online ✅
 * 
 * QUÉ EDITAR:
 * - mockMilestones: Etapas del proyecto (título, monto, estado, fecha)
 * - mockContributionLevels: Niveles de contribución (monto, beneficios, nombre)
 * - mockUpdates: Actualizaciones/noticias del proyecto
 * - mockEvidences: Evidencias por etapa (documentos, fotos, checksums)
 * - mockDocuments: Documentos públicos disponibles para descargar
 * 
 * ESTRUCTURA JSON: Respeta indentación y comas. Si rompes JSON → error en deploy.
 * Usa herramientas online si dudas: https://jsonlint.com/
 * 
 * v2.0+: Cuando cambios sean frecuentes (20+/mes) o contrates admin, implementar backoffice.
 */

import type { Milestone } from '@/domain/milestone';
import type { ContributionLevel } from '@/domain/contribution-level';

export const mockMilestones: Milestone[] = [
  {
    id: 1,
    name: 'Transformación Digital Comercial',
    description: 'Adquisición de rotativa RKHA190 para operaciones de impresión',
    details: 'Esta etapa cubre la fase inicial de la adquisición de la rotativa RKHA190. Incluye investigación de mercado, selección de proveedores, negociación de términos, y revisión técnica de especificaciones.',
    targetAmount: 100_000,
    raisedAmount: 30_000,
    targetDate: '2025-10-15',
    status: 'active',
    responsible: 'Área Comercial',
    published: true,
    evidences: [
      {
        id: 1,
        title: 'Propuesta técnica RKHA190',
        type: 'document',
        url: 'https://example.com/propuesta-tecnica.pdf',
        version: '1.0',
        publishedAt: '2025-09-15',
      },
      {
        id: 2,
        title: 'Comparativa de máquinas',
        type: 'document',
        url: 'https://example.com/comparativa.pdf',
        version: '1.0',
        publishedAt: '2025-09-20',
      },
    ],
    timeline: [
      {
        date: '2025-09-01',
        title: 'Análisis de mercado',
        description: 'Se realizó estudio comparativo de máquinas rotativas disponibles',
        status: 'completed',
      },
      {
        date: '2025-09-15',
        title: 'Selección de proveedor',
        description: 'Se eligió proveedor con mejor relación precio-calidad',
        status: 'completed',
      },
      {
        date: '2025-10-15',
        title: 'Cierre de negociación',
        description: 'Finalización de términos contractuales',
        status: 'in-progress',
      },
    ],
  },
  {
    id: 2,
    name: 'Anticipo 30% máquina',
    description: 'Pago inicial del 30% del valor de la rotativa',
    details: 'Anticipo requerido por el proveedor para iniciar el proceso de manufactura y reserva de unidad.',
    targetAmount: 22_000,
    raisedAmount: 0,
    targetDate: '2025-11-01',
    status: 'pending',
    dependencies: [1],
    published: true,
  },
  {
    id: 3,
    name: 'Saldo 70% máquina',
    description: 'Pago final del 70% antes de envío',
    details: 'Saldo final requerido antes del envío de la máquina. Se realiza contra inspección técnica final.',
    targetAmount: 200_000,
    raisedAmount: 0,
    targetDate: '2025-12-01',
    status: 'pending',
    dependencies: [2],
    published: true,
  },
  {
    id: 4,
    name: 'Flete Oceánico',
    description: 'Transporte marítimo desde proveedor a puerto',
    details: 'Incluye flete marítimo, seguro de transporte, y gestión de documentación aduanal internacional.',
    targetAmount: 60_000,
    raisedAmount: 0,
    targetDate: '2026-01-15',
    status: 'pending',
    dependencies: [3],
    published: true,
  },
  {
    id: 5,
    name: 'Aduana',
    description: 'Trámites aduanales y desaduanamiento',
    details: 'Incluye derechos aduanales, gestión de documentación, y tasas de desaduanamiento en puerto.',
    targetAmount: 18_000,
    raisedAmount: 0,
    targetDate: '2026-02-01',
    status: 'pending',
    dependencies: [4],
    published: true,
  },
  {
    id: 6,
    name: 'Instalación y montaje',
    description: 'Montaje, calibración e instalación de la rotativa',
    details: 'Incluye transporte interno, preparación de infraestructura, montaje en planta, calibración técnica, y capacitación de operadores.',
    targetAmount: 18_000,
    raisedAmount: 0,
    targetDate: '2026-02-15',
    status: 'pending',
    dependencies: [5],
    published: true,
  },
];

export const mockContributionLevels: ContributionLevel[] = [
  { amount: 25_000, benefit: 6, name: 'Colaborador' },
  { amount: 50_000, benefit: 8, name: 'Aliado' },
  { amount: 100_000, benefit: 10, name: 'Socio' },
  { amount: 250_000, benefit: 12, name: 'Impulsor' },
  { amount: 500_000, benefit: 14, name: 'Estratégico' },
  { amount: 1_000_000, benefit: 18, name: 'Principal' },
];
