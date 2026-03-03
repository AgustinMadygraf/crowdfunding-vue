export interface MilestoneRecord {
  id: number
  title: string
  description?: string
  status: 'pending' | 'active' | 'completed'
  target_amount: number
  raised_amount: number
  target_date: string
  published?: boolean
  created_at?: string
}

export interface UpdateRecord {
  id: number
  category: string
  title: string
  content: string
  status: 'draft' | 'published'
  published_at: string | null
  created_at: string
}

export interface DocumentRecord {
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

export interface GetUpdatesParams {
  category?: string
  limit?: number
}

export interface GetDocumentsParams {
  category?: string
}

export interface MilestonesReadRepositoryPort {
  getAll(): Promise<MilestoneRecord[]>
}

export interface UpdatesReadRepositoryPort {
  getAll(params?: GetUpdatesParams): Promise<UpdateRecord[]>
}

export interface DocumentsReadRepositoryPort {
  getAll(params?: GetDocumentsParams): Promise<DocumentRecord[]>
}
