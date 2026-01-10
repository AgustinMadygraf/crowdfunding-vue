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
  { id: 1, name: 'Anticipo', targetAmount: 100_000, raisedAmount: 30_000, targetDate: '2025-10-15', status: 'active' },
  { id: 2, name: 'Saldo embarque', targetAmount: 200_000, raisedAmount: 0, targetDate: '2025-12-01', status: 'pending' },
  { id: 3, name: 'Flete y Aduana', targetAmount: 60_000, raisedAmount: 0, targetDate: '2026-01-15', status: 'pending' },
  { id: 4, name: 'Montaje/PPM', targetAmount: 18_000, raisedAmount: 0, targetDate: '2026-02-01', status: 'pending' },
];

export const mockContributionLevels: ContributionLevel[] = [
  { amount: 25_000, benefit: 6, name: 'Colaborador' },
  { amount: 50_000, benefit: 8, name: 'Aliado' },
  { amount: 100_000, benefit: 10, name: 'Socio' },
  { amount: 250_000, benefit: 12, name: 'Impulsor' },
  { amount: 500_000, benefit: 14, name: 'Estratégico' },
  { amount: 1_000_000, benefit: 18, name: 'Principal' },
];
