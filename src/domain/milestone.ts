export type MilestoneStatus = 'active' | 'pending' | 'completed';

export interface Evidence {
  id: number;
  title: string;
  type: 'document' | 'photo' | 'video' | 'link';
  url: string;
  description?: string;
  version?: string;
  publishedAt?: string;
}

export interface TimelineItem {
  date: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
}

export interface Milestone {
  id: number;
  name: string;
  description?: string; // Descripción breve (una línea)
  details?: string; // Información detallada (párrafos)
  targetAmount: number;
  raisedAmount: number;
  targetDate: string;
  status: MilestoneStatus;
  evidences?: Evidence[]; // Documentos, fotos, videos
  timeline?: TimelineItem[]; // Hitos dentro de la etapa
  responsible?: string; // Quién lidera
  dependencies?: number[]; // IDs de etapas previas
  published?: boolean; // Draft o publicada
}

