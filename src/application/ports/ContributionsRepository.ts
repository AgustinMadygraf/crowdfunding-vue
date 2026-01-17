export interface CreateContributionDTO {
  user_id: string
  monto: number
  nivel_id: string
  nivel_nombre: string
  utm_params: Record<string, string>
}

export interface ContributionResponse {
  token: string
  preference_id: string
  contribution_id?: string
}

export interface UserContribution {
  id: string
  monto: number
  nivel_nombre: string
  estado_pago: 'pendiente' | 'procesando' | 'completado' | 'fallido' | 'cancelado'
  created_at: string
  completed_at?: string
  token: string
}

export interface PaginatedContributions {
  items: UserContribution[]
  total: number
  limit: number
  offset: number
  user_id: string
}

export class ContributionRepositoryError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message)
    this.name = 'ContributionRepositoryError'
  }
}

export interface ContributionsRepositoryPort {
  create(data: CreateContributionDTO): Promise<ContributionResponse>
  getByUserId(userId: string): Promise<UserContribution[]>
  getByToken(token: string): Promise<UserContribution>
}
