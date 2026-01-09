/**
 * DTOs (Data Transfer Objects) para API responses
 * Basados en SRS v1.0 - Sección 5 (Modelo de datos)
 */

import type { UTMParams } from '@/utils/utm'

// ===================================
// 5.1 Dominio público
// ===================================

export type MilestoneStatus = 'pending' | 'active' | 'completed'

export interface MilestoneDTO {
  id: number
  title: string
  description: string
  status: MilestoneStatus
  target_amount: number
  raised_amount: number
  target_date: string // ISO date
  published: boolean
  dependencies?: number[]
  created_at?: string
  updated_at?: string
}

export interface EvidenceDTO {
  id: number
  milestone_id: number
  type: string // 'document' | 'link' | 'image' | etc
  title: string
  url: string
  checksum_sha256: string
  version: string
  status: 'draft' | 'published'
  created_at: string
  updated_at?: string
}

export type UpdateCategory = 'Comercial' | 'Técnico' | 'Logística' | 'Legal'

export interface UpdateDTO {
  id: number
  category: UpdateCategory
  title: string
  content: string
  status: 'draft' | 'published'
  published_at: string | null
  created_at: string
  updated_at?: string
}

export interface DocumentDTO {
  id: number
  category: string
  title: string
  description?: string
  url: string
  checksum_sha256?: string
  version?: string
  published: boolean
  created_at: string
}

// ===================================
// 5.2 Suscripción
// ===================================

export type SubscriptionStatus =
  | 'interesado'
  | 'iniciado'
  | 'verificacion'
  | 'confirmado'
  | 'rechazado'
  | 'expirado'

export interface SubscriptionDTO {
  id: string
  lead_name: string
  lead_email: string
  lead_phone?: string
  lead_whatsapp?: string
  lead_province?: string
  lead_type?: string
  level_id: string
  status: SubscriptionStatus
  provider_reference?: string
  provider_status?: string
  utm_json: UTMParams | null
  consent_text_version: string
  consent_accepted_at: string
  created_at: string
  updated_at?: string
}

// Request DTOs

export interface CreateSubscriptionRequest {
  lead: {
    name: string
    email: string
    phone?: string
    whatsapp?: string
    province?: string
    type?: string
    amount_range?: string
  }
  level_id: string
  consent: {
    accepted: boolean
    version: string
    accepted_at: string
  }
  utm: UTMParams | Record<string, never>
}

export interface CreateSubscriptionResponse {
  subscription_id: string
  redirect_url: string
  status: SubscriptionStatus
}

export interface GetSubscriptionResponse {
  id: string
  status: SubscriptionStatus
  provider_status?: string
  lead_name: string
  level_id: string
  created_at: string
  updated_at?: string
}

// ===================================
// 5.3 Auditoría (Admin)
// ===================================

export interface AuditEventDTO {
  id: number
  actor_id: string
  action: string
  entity_type: string
  entity_id: string | number
  before_json?: Record<string, unknown>
  after_json?: Record<string, unknown>
  timestamp: string
  ip?: string
}

// ===================================
// Response wrappers
// ===================================

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface ListResponse<T> {
  data: T[]
  count: number
}
