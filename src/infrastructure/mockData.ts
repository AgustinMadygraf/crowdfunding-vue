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
