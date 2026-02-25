/*
Path: src/infrastructure/repositories/ContributionsRepository.ts
*/

import type {
  ContributionsRepositoryPort,
  CreateContributionDTO,
  ContributionResponse,
  UserContribution
} from '@/application/ports/ContributionsRepository'
import { ContributionRepositoryError } from '@/application/ports/ContributionsRepository'
import { authService } from '@/infrastructure/services/authServiceFactory'
import { csrfService } from '@/infrastructure/services/csrfService'
import { DEFAULT_TIMEOUT_MS } from '@/config/api'
import { getAppConfig } from '@/config/appConfig'

export class ContributionsRepository implements ContributionsRepositoryPort {
  private readonly apiBaseUrl: string
  private readonly debugHttp: boolean

  constructor(apiBaseUrl?: string) {
    this.apiBaseUrl = apiBaseUrl || getAppConfig().apiBaseUrl
    this.debugHttp = import.meta.env.VITE_DEBUG_HTTP === 'true'
    if (import.meta.env.DEV) {
      this.pingHealth().catch(() => {})
    }
  }

  private async pingHealth(): Promise<void> {
    const url = `${this.apiBaseUrl}/api/health`
    try {
      const response = await this.fetchWithGuard(url, { method: 'GET' })
      const contentType = response.headers.get('content-type') || ''    } catch (error) {
      console.warn('[ContributionsRepository] Health check failed:', url, error)
    }
  }

  private sanitizeUrlForLogs(url: string): string {
    return url.replace(/(\/api\/contributions\/)[^/?#]+/i, '$1[redacted]')
  }

  /**
   * Wrapper de fetch con timeout y guardia de content-type
   * Captura detalles de error para diagnÃ³stico en producciÃ³n
   */
  private async fetchWithGuard(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)
    const urlStr = typeof input === 'string' ? input : input.toString()
    const safeUrlForLogs = this.sanitizeUrlForLogs(urlStr)
    const requestId = `req_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`
    const startedAt = Date.now()
    const requestHeaders = new Headers(init?.headers || {})
    requestHeaders.set('X-Request-Id', requestId)
    requestHeaders.set('ngrok-skip-browser-warning', 'true')
    
    // Log request details for debugging
    if (this.debugHttp) {
      const hasAuthorization = !!requestHeaders.get('Authorization')
      console.log(`[ContributionsRepository] ðŸ“¤ REQUEST [${requestId}]`)
      console.log(`  URL: ${safeUrlForLogs}`)
      console.log(`  Method: ${init?.method || 'GET'}`)
      console.log(`  Accept: ${requestHeaders.get('Accept') || 'not set'}`)
      console.log(`  Authorization: ${hasAuthorization ? 'present' : 'none'}`)
      console.log(`  Content-Type: ${requestHeaders.get('Content-Type') || 'not set'}`)
    }
    
    try {
      const response = await fetch(input, { ...init, headers: requestHeaders, signal: controller.signal })
      const contentType = response.headers.get('content-type') || ''
      const elapsedMs = Date.now() - startedAt

      // Log response details for debugging
      if (this.debugHttp) {
        const safeResponseUrl = this.sanitizeUrlForLogs(response.url)
        console.log(`[ContributionsRepository] ðŸ“¥ RESPONSE [${requestId}] (${elapsedMs}ms)`)
        console.log(`  Status: ${response.status} ${response.statusText}`)
        console.log(`  Final URL: ${safeResponseUrl}`)
        console.log(`  Redirected: ${response.redirected}`)
        console.log(`  Content-Type: ${contentType}`)
        console.log(`  Location header: ${response.headers.get('location') || 'none'}`)
        if (response.redirected && response.url !== urlStr) {
          console.warn(`[ContributionsRepository] âš ï¸ REDIRECT CHAIN DETECTED`)
          console.warn(`  Original: ${safeUrlForLogs}`)
          console.warn(`  Final: ${safeResponseUrl}`)
        }
      }

      if (contentType.includes('text/html')) {
        // Probable misconfig: el frontend sirviÃ³ HTML (index.html) en vez de JSON
        const body = await response.text().catch(() => '')
        const titleMatch = body.match(/<title>([^<]*)<\/title>/i)
        const htmlTitle = titleMatch ? titleMatch[1].trim() : null
        const pageOrigin = typeof window !== 'undefined' ? window.location.origin : 'unknown'
        const responseUrl = response.url || urlStr
        const safeResponseUrl = this.sanitizeUrlForLogs(responseUrl)
        const ngrokWarning = contentType.includes('text/html') && responseUrl.includes('ngrok')
        
        const errorDetails = {
          urlRequested: safeUrlForLogs,
          requestId,
          responseUrl: safeResponseUrl,
          pageOrigin,
          apiBaseUrl: this.apiBaseUrl,
          contentType,
          statusCode: response.status,
          elapsedMs,
          htmlTitle,
          bodyPreview: body.slice(0, 500),
          fullBodyLength: body.length,
          redirected: response.redirected,
          redirectChain: response.redirected ? `${safeUrlForLogs} -> ${safeResponseUrl}` : null,
          isNgrokHTML: ngrokWarning,
          requestHeaders: {
            Accept: requestHeaders.get('Accept'),
            'Content-Type': requestHeaders.get('Content-Type'),
            'ngrok-skip-browser-warning': requestHeaders.get('ngrok-skip-browser-warning'),
            AuthorizationPresent: !!requestHeaders.get('Authorization')
          },
          responseHeaders: {
            'Content-Type': contentType,
            Location: response.headers.get('location'),
            'X-Ngrok-Session-ID': response.headers.get('x-ngrok-session-id')
          }
        }
        
        console.error('[ContributionsRepository] ðŸš¨ CRITICAL - HTML response when JSON expected')
        console.error(`[ContributionsRepository] [${requestId}] Requested URL: ${safeUrlForLogs}`)
        console.error(`[ContributionsRepository] [${requestId}] Response URL: ${safeResponseUrl}`)
        console.error(`[ContributionsRepository] [${requestId}] API Base URL: ${this.apiBaseUrl}`)
        console.error(`[ContributionsRepository] [${requestId}] Page Origin: ${pageOrigin}`)
        console.error(`[ContributionsRepository] [${requestId}] Status: ${response.status}`)
        console.error(`[ContributionsRepository] [${requestId}] Content-Type: ${contentType}`)
        console.error(`[ContributionsRepository] [${requestId}] Redirected: ${response.redirected}`)
        if (response.redirected && response.url !== urlStr) {
          console.error(`[ContributionsRepository] [${requestId}] âš ï¸ REDIRECT: ${safeUrlForLogs} -> ${safeResponseUrl}`)
        }
        if (htmlTitle) {
          console.error(`[ContributionsRepository] [${requestId}] HTML Title: ${htmlTitle}`)
        }
        if (ngrokWarning) {
          console.error('[ContributionsRepository] ðŸ†˜ Detected ngrok HTML response - this might be ngrok interstitial page')
          console.error('[ContributionsRepository]    Try adding ngrok-skip-browser-warning header (should be automatic now)')
        }
        console.error(`[ContributionsRepository] [${requestId}] Response preview (200 chars):`)
        console.error(body.slice(0, 200))
        console.error('[ContributionsRepository] Full error details:', errorDetails)
        
        throw new ContributionRepositoryError(
          'Respuesta HTML recibida del endpoint. Revisa VITE_API_BASE_URL o el proxy.',
          response.status,
          errorDetails
        )
      }

      return response
    } catch (error) {
      if (error instanceof ContributionRepositoryError) {
        throw error
      }

      // Timeout u otro error de fetch
      if (error instanceof TypeError && error.message.includes('abort')) {
        console.error('[ContributionsRepository] â±ï¸ TIMEOUT en request:', safeUrlForLogs)
        throw new ContributionRepositoryError(
          `Timeout despuÃ©s de ${DEFAULT_TIMEOUT_MS}ms en ${safeUrlForLogs}`,
          undefined,
          { url: safeUrlForLogs, timeout: DEFAULT_TIMEOUT_MS }
        )
      }

      console.error('[ContributionsRepository] ðŸ”Œ Fetch error:', error)
      throw error
    } finally {
      clearTimeout(timeout)
    }
  }

  /**
   * Crea una nueva contribuciÃ³n
   */
  async create(data: CreateContributionDTO): Promise<ContributionResponse> {
    // Refrescar token si es necesario antes de la operaciÃ³n
    await authService.refreshTokenIfNeeded()

    // Obtener JWT y CSRF token
    const jwt = authService.getAuthToken()
    const csrfToken = csrfService.getToken()

    const headers: Record<string, string> = {
      ...authService.getAuthHeaders(),
      ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
      ...(jwt ? { 'Authorization': `Bearer ${jwt}` } : {}),
      'Content-Type': 'application/json'
    }
    const url = `${this.apiBaseUrl}/api/contributions`

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

        console.error('[ContributionsRepository] âŒ Error HTTP', response.status)
        console.error('[ContributionsRepository] Error response:', errorData)

        throw new ContributionRepositoryError(
          errorData.message || `HTTP ${response.status}`,
          response.status,
          errorData
        )
      }

      const result: ContributionResponse = await response.json()
      
      return result
    } catch (error) {
      if (error instanceof ContributionRepositoryError) {
        throw error
      }

      const errMsg = error instanceof Error ? error.message : 'Error desconocido'
      console.error('[ContributionsRepository] âŒ ConexiÃ³n o parsing error:', errMsg)
      console.error('[ContributionsRepository] Error details:', error)
      throw new ContributionRepositoryError(
        `No se pudo conectar a ${url}: ${errMsg}`,
        undefined,
        { originalError: error, url }
      )
    }
  }

  /**
   * Obtiene las contribuciones de un usuario
   */
  async getByUserId(userId: string): Promise<UserContribution[]> {
    const headers = authService.getAuthHeaders()
    const url = `${this.apiBaseUrl}/api/users/${userId}/contributions`

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
        console.error('[ContributionsRepository] âŒ Formato de respuesta invÃ¡lido:', data)
        throw new ContributionRepositoryError('Formato de respuesta invÃ¡lido para contribuciones')
      }
      return list
    } catch (error) {
      if (error instanceof ContributionRepositoryError) {
        throw error
      }

      console.error('[ContributionsRepository] âŒ Error al obtener contribuciones:', error)
      throw new ContributionRepositoryError(
        error instanceof Error ? error.message : 'Error desconocido'
      )
    }
  }

  /**
   * Obtiene una contribuciÃ³n por su token
   */
  async getByToken(token: string): Promise<UserContribution> {
    // Refrescar token si es necesario antes de la operaciÃ³n
    await authService.refreshTokenIfNeeded()
    
    // Validar token antes de fetch
    if (!token?.trim()) {
      throw new ContributionRepositoryError('Token de contribuciÃ³n invÃ¡lido o vacÃ­o')
    }

    const headers = authService.getAuthHeaders()
    const url = `${this.apiBaseUrl}/api/contributions/${token}`
    
    // Log mÃ©todo y parÃ¡metros
    if (this.debugHttp) {
      console.log('[ContributionsRepository] ðŸ” getByToken() called')
      console.log(`  Token length: ${token.length}`)
      console.log(`  URL: ${this.sanitizeUrlForLogs(url)}`)
      console.log(`  Authorization: ${headers.Authorization ? 'present' : 'none'}`)
    }
    
    try {
      const response = await this.fetchWithGuard(url, { headers, method: 'GET' })

      if (!response.ok) {
        const statusText = response.statusText || 'Unknown error'
        console.error('[ContributionsRepository] âŒ HTTP Error:', response.status, statusText)
        throw new ContributionRepositoryError(
          `Error ${response.status}: No se pudo cargar la contribuciÃ³n`,
          response.status,
          { url: this.sanitizeUrlForLogs(url), tokenLength: token.length, status: response.status }
        )
      }

      const contribution: UserContribution = await response.json()
      
      if (this.debugHttp) {
        console.log('[ContributionsRepository] âœ… getByToken() success')
        console.log(`  Contribution ID: ${contribution.id}`)
      }
      
      return contribution
    } catch (error) {
      if (error instanceof ContributionRepositoryError) {
        throw error
      }

      const errMsg = error instanceof Error ? error.message : 'Error desconocido'
      console.error('[ContributionsRepository] âŒ ConexiÃ³n o parsing error:', errMsg)
      console.error('[ContributionsRepository] Error details:', error)
      console.error('[ContributionsRepository] URL:', this.sanitizeUrlForLogs(url))
      console.error('[ContributionsRepository] âš ï¸ DIAGNOSTIC INFO:')
      console.error('[ContributionsRepository]   - Is it an ngrok URL?', url.includes('ngrok'))
      console.error('[ContributionsRepository]   - Authorization header sent?', !!headers.Authorization)
      console.error('[ContributionsRepository]   - API Base URL config:', this.apiBaseUrl)
      
      throw new ContributionRepositoryError(
        `No se pudo obtener la contribuciÃ³n desde ${this.sanitizeUrlForLogs(url)}: ${errMsg}`,
        undefined,
        { originalError: error, url: this.sanitizeUrlForLogs(url), tokenLength: token.length }
      )
    }
  }
}

// Instancia singleton por conveniencia (se puede inyectar despuÃ©s)
export const contributionsRepository = new ContributionsRepository()

