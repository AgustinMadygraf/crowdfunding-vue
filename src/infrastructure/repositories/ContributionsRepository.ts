/**
 * Repository: Contribuciones
 * Encapsula toda la lógica de acceso a datos de contribuciones
 */

import { authService } from '@/infrastructure/services/authServiceFactory'
import { getApiBaseUrl, DEFAULT_TIMEOUT_MS } from '@/config/api'

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
    this.apiBaseUrl = apiBaseUrl || getApiBaseUrl()
  }

  /**
   * Wrapper de fetch con timeout y guardia de content-type
   */
  private async fetchWithGuard(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)
    try {
      const response = await fetch(input, { ...init, signal: controller.signal })
      const contentType = response.headers.get('content-type') || ''

      if (contentType.includes('text/html')) {
        // Probable misconfig: el frontend sirvió HTML (index.html) en vez de JSON
        const body = await response.text().catch(() => '')
        throw new ContributionRepositoryError(
          'Respuesta HTML recibida del endpoint. Revisa VITE_API_BASE_URL o el proxy.',
          response.status,
          { contentType, body: body.slice(0, 500) }
        )
      }

      return response
    } finally {
      clearTimeout(timeout)
    }
  }

  /**
   * Crea una nueva contribución
   */
  async create(data: CreateContributionDTO): Promise<ContributionResponse> {
    // Refrescar token si es necesario antes de la operación
    await authService.refreshTokenIfNeeded()

    // Obtener JWT y CSRF token
    const jwt = authService.getAuthToken()
    // Usar el composable para obtener el token CSRF
    let csrfToken: string | null = null
    try {
      // Import dinámico para evitar dependencias circulares
      const { useCsrfToken } = await import('@/application/composables/useCsrfToken')
      csrfToken = useCsrfToken().getToken()
    } catch (e) {
      // Fallback: intentar leer de csrfService
      try {
        const { csrfService } = await import('@/infrastructure/services/csrfService')
        csrfToken = csrfService.getToken()
      } catch {}
    }

    const headers: Record<string, string> = {
      ...authService.getAuthHeaders(),
      ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
      ...(jwt ? { 'Authorization': `Bearer ${jwt}` } : {}),
      'Content-Type': 'application/json'
    }
    const url = `${this.apiBaseUrl}/api/contributions`

    if (import.meta.env.DEV) {
      console.log('[ContributionsRepository] 📤 POST', url)
      console.log('[ContributionsRepository] Headers:', headers)
    }

    try {
      const response = await this.fetchWithGuard(url, {
        method: 'POST',
        credentials: 'include',
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
      const response = await this.fetchWithGuard(url, { headers })

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
  async getByToken(token: string): Promise<UserContribution> {    // Refrescar token si es necesario antes de la operación
    await authService.refreshTokenIfNeeded()
        // Validar token antes de fetch
    if (!token?.trim()) {
      throw new ContributionRepositoryError('Token de contribución inválido o vacío')
    }

    const headers = authService.getAuthHeaders()
    const url = `${this.apiBaseUrl}/api/contributions/${token}`

    if (import.meta.env.DEV) {
      console.log('[ContributionsRepository] 📥 GET', url)
    }

    try {
      const response = await this.fetchWithGuard(url, { headers })

      if (!response.ok) {
        throw new ContributionRepositoryError(
          'No se pudo cargar la contribución',
          response.status
        )
      }

      const contribution: UserContribution = await response.json()
      if (import.meta.env.DEV) {
        console.log('[ContributionsRepository] ✅ Contribución obtenida:', contribution.id)
      }
      
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
