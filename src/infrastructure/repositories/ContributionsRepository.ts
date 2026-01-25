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

  /**
   * Wrapper de fetch con timeout y guardia de content-type
   * Captura detalles de error para diagnóstico en producción
   */
  private async fetchWithGuard(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)
    const urlStr = typeof input === 'string' ? input : input.toString()
    const requestId = `req_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`
    const startedAt = Date.now()
    const requestHeaders = new Headers(init?.headers || {})
    requestHeaders.set('X-Request-Id', requestId)
    requestHeaders.set('ngrok-skip-browser-warning', 'true')
    
    // Log request details for debugging
    if (this.debugHttp) {
      const authHeaderPreview = requestHeaders.get('Authorization')
        ? `Bearer ${requestHeaders.get('Authorization')?.slice(0, 30)}...`
        : 'none'
      console.log(`[ContributionsRepository] 📤 REQUEST [${requestId}]`)
      console.log(`  URL: ${urlStr}`)
      console.log(`  Method: ${init?.method || 'GET'}`)
      console.log(`  Accept: ${requestHeaders.get('Accept') || 'not set'}`)
      console.log(`  Authorization: ${authHeaderPreview}`)
      console.log(`  Content-Type: ${requestHeaders.get('Content-Type') || 'not set'}`)
    }
    
    try {
      const response = await fetch(input, { ...init, headers: requestHeaders, signal: controller.signal })
      const contentType = response.headers.get('content-type') || ''
      const elapsedMs = Date.now() - startedAt

      // Log response details for debugging
      if (this.debugHttp) {
        console.log(`[ContributionsRepository] 📥 RESPONSE [${requestId}] (${elapsedMs}ms)`)
        console.log(`  Status: ${response.status} ${response.statusText}`)
        console.log(`  Final URL: ${response.url}`)
        console.log(`  Redirected: ${response.redirected}`)
        console.log(`  Content-Type: ${contentType}`)
        console.log(`  Location header: ${response.headers.get('location') || 'none'}`)
        if (response.redirected && response.url !== urlStr) {
          console.warn(`[ContributionsRepository] ⚠️ REDIRECT CHAIN DETECTED`)
          console.warn(`  Original: ${urlStr}`)
          console.warn(`  Final: ${response.url}`)
        }
      }

      if (contentType.includes('text/html')) {
        // Probable misconfig: el frontend sirvió HTML (index.html) en vez de JSON
        const body = await response.text().catch(() => '')
        const titleMatch = body.match(/<title>([^<]*)<\/title>/i)
        const htmlTitle = titleMatch ? titleMatch[1].trim() : null
        const pageOrigin = typeof window !== 'undefined' ? window.location.origin : 'unknown'
        const responseUrl = response.url || urlStr
        const ngrokWarning = contentType.includes('text/html') && responseUrl.includes('ngrok')
        
        const errorDetails = {
          urlRequested: urlStr,
          requestId,
          responseUrl,
          pageOrigin,
          apiBaseUrl: this.apiBaseUrl,
          contentType,
          statusCode: response.status,
          elapsedMs,
          htmlTitle,
          bodyPreview: body.slice(0, 500),
          fullBodyLength: body.length,
          redirected: response.redirected,
          redirectChain: response.redirected ? `${urlStr} -> ${responseUrl}` : null,
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
        
        console.error('[ContributionsRepository] 🚨 CRITICAL - HTML response when JSON expected')
        console.error(`[ContributionsRepository] [${requestId}] Requested URL: ${urlStr}`)
        console.error(`[ContributionsRepository] [${requestId}] Response URL: ${responseUrl}`)
        console.error(`[ContributionsRepository] [${requestId}] API Base URL: ${this.apiBaseUrl}`)
        console.error(`[ContributionsRepository] [${requestId}] Page Origin: ${pageOrigin}`)
        console.error(`[ContributionsRepository] [${requestId}] Status: ${response.status}`)
        console.error(`[ContributionsRepository] [${requestId}] Content-Type: ${contentType}`)
        console.error(`[ContributionsRepository] [${requestId}] Redirected: ${response.redirected}`)
        if (response.redirected && response.url !== urlStr) {
          console.error(`[ContributionsRepository] [${requestId}] ⚠️ REDIRECT: ${urlStr} -> ${responseUrl}`)
        }
        if (htmlTitle) {
          console.error(`[ContributionsRepository] [${requestId}] HTML Title: ${htmlTitle}`)
        }
        if (ngrokWarning) {
          console.error('[ContributionsRepository] 🆘 Detected ngrok HTML response - this might be ngrok interstitial page')
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
        console.error('[ContributionsRepository] ⏱️ TIMEOUT en request:', urlStr)
        throw new ContributionRepositoryError(
          `Timeout después de ${DEFAULT_TIMEOUT_MS}ms en ${urlStr}`,
          undefined,
          { url: urlStr, timeout: DEFAULT_TIMEOUT_MS }
        )
      }

      console.error('[ContributionsRepository] 🔌 Fetch error:', error)
      throw error
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

        console.error('[ContributionsRepository] ❌ Error HTTP', response.status)
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
      console.error('[ContributionsRepository] ❌ Conexión o parsing error:', errMsg)
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
        console.error('[ContributionsRepository] ❌ Formato de respuesta inválido:', data)
        throw new ContributionRepositoryError('Formato de respuesta inválido para contribuciones')
      }
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
    // Refrescar token si es necesario antes de la operación
    await authService.refreshTokenIfNeeded()
    
    // Validar token antes de fetch
    if (!token?.trim()) {
      throw new ContributionRepositoryError('Token de contribución inválido o vacío')
    }

    const headers = authService.getAuthHeaders()
    const url = `${this.apiBaseUrl}/api/contributions/${token}`
    
    // Log método y parámetros
    if (this.debugHttp) {
      console.log('[ContributionsRepository] 🔍 getByToken() called')
      console.log(`  Token: ${token.slice(0, 20)}...`)
      console.log(`  URL: ${url}`)
      console.log(`  Headers:`, headers)
    }
    
    try {
      const response = await this.fetchWithGuard(url, { headers, method: 'GET' })

      if (!response.ok) {
        const statusText = response.statusText || 'Unknown error'
        console.error('[ContributionsRepository] ❌ HTTP Error:', response.status, statusText)
        throw new ContributionRepositoryError(
          `Error ${response.status}: No se pudo cargar la contribución`,
          response.status,
          { url, token, status: response.status }
        )
      }

      const contribution: UserContribution = await response.json()
      
      if (this.debugHttp) {
        console.log('[ContributionsRepository] ✅ getByToken() success')
        console.log(`  Contribution ID: ${contribution.id}`)
      }
      
      return contribution
    } catch (error) {
      if (error instanceof ContributionRepositoryError) {
        throw error
      }

      const errMsg = error instanceof Error ? error.message : 'Error desconocido'
      console.error('[ContributionsRepository] ❌ Conexión o parsing error:', errMsg)
      console.error('[ContributionsRepository] Error details:', error)
      console.error('[ContributionsRepository] URL:', url)
      console.error('[ContributionsRepository] ⚠️ DIAGNOSTIC INFO:')
      console.error('[ContributionsRepository]   - Is it an ngrok URL?', url.includes('ngrok'))
      console.error('[ContributionsRepository]   - Authorization header sent?', !!headers.Authorization)
      console.error('[ContributionsRepository]   - API Base URL config:', this.apiBaseUrl)
      
      throw new ContributionRepositoryError(
        `No se pudo obtener la contribución desde ${url}: ${errMsg}`,
        undefined,
        { originalError: error, url, token }
      )
    }
  }
}

// Instancia singleton por conveniencia (se puede inyectar después)
export const contributionsRepository = new ContributionsRepository()
