/**
 * Repository: Contribuciones
 * Encapsula toda la lógica de acceso a datos de contribuciones
 */

import { authService } from '@/infrastructure/services/authServiceFactory'

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

/**
 * Excepción personalizada para errores del repositorio
 */
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

/**
 * Repository de contribuciones
 * Abstrae la lógica de acceso al backend
 */
export class ContributionsRepository {
  private readonly apiBaseUrl: string

  constructor(apiBaseUrl?: string) {
    this.apiBaseUrl = apiBaseUrl || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
  }

  /**
   * Crea una nueva contribución
   */
  async create(data: CreateContributionDTO): Promise<ContributionResponse> {
    const headers = authService.getAuthHeaders()
    const url = `${this.apiBaseUrl}/api/contributions`

    console.log('[ContributionsRepository] 📤 POST', url)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        let errorData: any = {}
        try {
          errorData = await response.json()
        } catch {
          const text = await response.text()
          errorData = { message: text || response.statusText }
        }

        console.error('[ContributionsRepository] ❌ Error HTTP', response.status)
        console.error('[ContributionsRepository] Respuesta:', errorData)

        throw new ContributionRepositoryError(
          errorData.message || `HTTP ${response.status}`,
          response.status,
          errorData
        )
      }

      const result: ContributionResponse = await response.json()
      console.log('[ContributionsRepository] ✅ Contribución creada:', result.contribution_id || result.token)
      
      return result
    } catch (error) {
      if (error instanceof ContributionRepositoryError) {
        throw error
      }

      console.error('[ContributionsRepository] ❌ Error de conexión:', error)
      throw new ContributionRepositoryError(
        `No se pudo conectar: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        undefined,
        error
      )
    }
  }

  /**
   * Obtiene las contribuciones de un usuario
   */
  async getByUserId(userId: string): Promise<UserContribution[]> {
    const headers = authService.getAuthHeaders()
    const url = `${this.apiBaseUrl}/api/users/${userId}/contributions`

    console.log('[ContributionsRepository] 📥 GET', url)

    try {
      const response = await fetch(url, { headers })

      if (!response.ok) {
        throw new ContributionRepositoryError(
          'No se pudieron cargar las contribuciones',
          response.status
        )
      }

      const data = await response.json()

      // Normalizar respuesta: aceptar array directo, {contributions: [...]} o {items: [...]}
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.contributions)
          ? data.contributions
          : Array.isArray(data?.items)
            ? data.items
            : null

      if (!list) {
        console.error('[ContributionsRepository] ❌ Formato de respuesta inválido:', data)
        throw new ContributionRepositoryError('Formato de respuesta inválido para contribuciones')
      }

      console.log('[ContributionsRepository] ✅ Contribuciones obtenidas:', list.length)
      return list
    } catch (error) {
      if (error instanceof ContributionRepositoryError) {
        throw error
      }

      console.error('[ContributionsRepository] ❌ Error al obtener contribuciones:', error)
      throw new ContributionRepositoryError(
        error instanceof Error ? error.message : 'Error desconocido'
      )
    }
  }

  /**
   * Obtiene una contribución por su token
   */
  async getByToken(token: string): Promise<UserContribution> {
    const headers = authService.getAuthHeaders()
    const url = `${this.apiBaseUrl}/api/contributions/${token}`

    console.log('[ContributionsRepository] 📥 GET', url)

    try {
      const response = await fetch(url, { headers })

      if (!response.ok) {
        throw new ContributionRepositoryError(
          'No se pudo cargar la contribución',
          response.status
        )
      }

      const contribution: UserContribution = await response.json()
      console.log('[ContributionsRepository] ✅ Contribución obtenida:', contribution.id)
      
      return contribution
    } catch (error) {
      if (error instanceof ContributionRepositoryError) {
        throw error
      }

      console.error('[ContributionsRepository] ❌ Error al obtener contribución:', error)
      throw new ContributionRepositoryError(
        error instanceof Error ? error.message : 'Error desconocido'
      )
    }
  }
}

// Instancia singleton por conveniencia (se puede inyectar después)
export const contributionsRepository = new ContributionsRepository()
