/**
 * API Diagnostic Utility
 * 
 * Herramienta para diagnosticar problemas con requests API
 * Úsala abriendo la consola y llamando: window.__apiDiagnostic.test()
 */

import { getAppConfig } from '@/config/appConfig'
import { authService } from '@/infrastructure/services/authServiceFactory'

interface DiagnosticResult {
  timestamp: string
  testName: string
  status: 'PASS' | 'FAIL' | 'WARNING'
  details: Record<string, any>
  error?: string
}

class ApiDiagnostic {
  private results: DiagnosticResult[] = []

  /**
   * Ejecuta todas las pruebas de diagnóstico
   */
  async runFullDiagnostics(): Promise<void> {
    console.clear()
    console.log('%c🔍 API DIAGNOSTIC SUITE', 'font-size: 16px; font-weight: bold; color: #0066cc')
    console.log('=' .repeat(80))

    this.results = []

    await this.testConfigurationEnvironment()
    await this.testAuthHeaders()
    await this.testCorsHeaders()
    await this.testHealthEndpoint()
    await this.testContributionCreate()
    await this.testContributionGetByToken()

    this.printSummary()
  }

  /**
   * Test 1: Environment Configuration
   */
  private async testConfigurationEnvironment(): Promise<void> {
    const test = 'Environment Configuration'
    console.log(`\n📋 ${test}`)

    try {
      const config = getAppConfig()
      const debugHttp = import.meta.env.VITE_DEBUG_HTTP === 'true'

      const details = {
        apiBaseUrl: config.apiBaseUrl,
        siteUrl: config.siteUrl,
        environment: import.meta.env.MODE,
        debugHttp,
        isNgrok: config.apiBaseUrl.includes('ngrok'),
        apiBaseUrlIsRelative: config.apiBaseUrl.startsWith('/'),
        windowOrigin: typeof window !== 'undefined' ? window.location.origin : 'unknown'
      }

      console.table(details)
      this.addResult({
        testName: test,
        status: 'PASS',
        details
      })
    } catch (error) {
      console.error('%cFAIL:', 'color: red', error)
      this.addResult({
        testName: test,
        status: 'FAIL',
        details: {},
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  /**
   * Test 2: Authentication Headers
   */
  private async testAuthHeaders(): Promise<void> {
    const test = 'Authentication Headers'
    console.log(`\n🔐 ${test}`)

    try {
      const headers = authService.getAuthHeaders()
      const state = authService.getAuthState()
      const token = authService.getAuthToken()
      const isAuth = authService.isAuthenticated()

      const details = {
        hasAuthHeaders: !!headers,
        hasAuthorization: !!headers['Authorization'],
        authHeaderValue: headers['Authorization'] ? headers['Authorization'].slice(0, 50) + '...' : 'none',
        tokenExists: !!token,
        tokenLength: token?.length || 0,
        tokenPreview: token ? token.slice(0, 30) + '...' : 'none',
        isAuthenticated: isAuth,
        user: state.user ? { id: state.user.id, email: state.user.email } : null
      }

      console.table(details)
      this.addResult({
        testName: test,
        status: isAuth ? 'PASS' : 'WARNING',
        details
      })
    } catch (error) {
      console.error('%cFAIL:', 'color: red', error)
      this.addResult({
        testName: test,
        status: 'FAIL',
        details: {},
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  /**
   * Test 3: CORS and Request Headers
   */
  private async testCorsHeaders(): Promise<void> {
    const test = 'CORS & Request Headers'
    console.log(`\n🌐 ${test}`)

    try {
      const config = getAppConfig()
      const headers = new Headers({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      })

      const authHeaders = authService.getAuthHeaders()
      Object.entries(authHeaders).forEach(([key, value]) => {
        headers.set(key, value as string)
      })

      const details = {
        headersInclude: {
          'Content-Type': headers.get('Content-Type'),
          'Accept': headers.get('Accept'),
          'Authorization': headers.get('Authorization') ? 'Bearer ...' : 'none',
          'ngrok-skip-browser-warning': headers.get('ngrok-skip-browser-warning'),
          'X-Request-Id': headers.get('X-Request-Id') || 'will be generated'
        },
        credentialsMode: 'include (default)',
        corsMode: 'default (uses credentials if same-origin)'
      }

      console.table(details)
      this.addResult({
        testName: test,
        status: 'PASS',
        details
      })
    } catch (error) {
      console.error('%cFAIL:', 'color: red', error)
      this.addResult({
        testName: test,
        status: 'FAIL',
        details: {},
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  /**
   * Test 4: Health Endpoint
   */
  private async testHealthEndpoint(): Promise<void> {
    const test = 'Health Endpoint (/api/health)'
    console.log(`\n💚 ${test}`)

    try {
      const config = getAppConfig()
      const url = config.apiBaseUrl + '/api/health'

      console.log(`Testing: ${url}`)

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        credentials: 'include'
      })

      const contentType = response.headers.get('content-type') || ''
      const details = {
        url: response.url,
        status: response.status,
        statusText: response.statusText,
        contentType,
        redirected: response.redirected,
        bodyPreview: ''
      }

      if (contentType.includes('json')) {
        const json = await response.json()
        details.bodyPreview = JSON.stringify(json).slice(0, 200)
      } else {
        const text = await response.text()
        details.bodyPreview = text.slice(0, 200)
      }

      console.table(details)
      this.addResult({
        testName: test,
        status: response.ok ? 'PASS' : 'WARNING',
        details
      })
    } catch (error) {
      console.error('%cFAIL:', 'color: red', error)
      this.addResult({
        testName: test,
        status: 'FAIL',
        details: {},
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  /**
   * Test 5: Create Contribution (POST)
   * NOTA: Esto crearía una contribución real, así que solo loguea la URL
   */
  private async testContributionCreate(): Promise<void> {
    const test = 'Create Contribution (Simulated)'
    console.log(`\n📝 ${test}`)

    try {
      const config = getAppConfig()
      const url = config.apiBaseUrl + '/api/contributions'

      const details = {
        url,
        method: 'POST',
        contentType: 'application/json',
        requiresAuth: true,
        expectedResponse: 'JSON with contribution_token',
        status: 'NOT TESTED (would create real contribution)',
        note: 'Run actual contribution flow to test'
      }

      console.table(details)
      this.addResult({
        testName: test,
        status: 'WARNING',
        details
      })
    } catch (error) {
      console.error('%cFAIL:', 'color: red', error)
      this.addResult({
        testName: test,
        status: 'FAIL',
        details: {},
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  /**
   * Test 6: Get Contribution by Token (GET)
   * NOTA: Necesita un token válido
   */
  private async testContributionGetByToken(): Promise<void> {
    const test = 'Get Contribution by Token (Simulated)'
    console.log(`\n🎫 ${test}`)

    try {
      const config = getAppConfig()
      const testToken = 'contrib_test_12345'
      const url = `${config.apiBaseUrl}/api/contributions/${testToken}`

      const headers = new Headers({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      })

      const authHeaders = authService.getAuthHeaders()
      Object.entries(authHeaders).forEach(([key, value]) => {
        headers.set(key, value as string)
      })

      const details = {
        url,
        method: 'GET',
        testToken,
        contentType: 'application/json',
        requiresAuth: true,
        headers: {
          'Accept': 'application/json',
          'Authorization': headers.get('Authorization') ? 'Bearer ...' : 'none',
          'ngrok-skip-browser-warning': 'true'
        },
        expectedResponse: 'JSON with contribution details',
        status: 'NOT TESTED (need valid token)',
        note: 'After creating contribution, test with real token'
      }

      console.table(details)
      this.addResult({
        testName: test,
        status: 'WARNING',
        details
      })
    } catch (error) {
      console.error('%cFAIL:', 'color: red', error)
      this.addResult({
        testName: test,
        status: 'FAIL',
        details: {},
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  /**
   * Test specific endpoint manually
   */
  async testCustomEndpoint(endpoint: string, token?: string): Promise<void> {
    console.log(`\n🧪 Testing custom endpoint: ${endpoint}`)

    try {
      const config = getAppConfig()
      const url = endpoint.startsWith('http')
        ? endpoint
        : `${config.apiBaseUrl}${endpoint.startsWith('/') ? '' : '/api'}${endpoint}`

      const headers = new Headers({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      })

      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      } else {
        const authHeaders = authService.getAuthHeaders()
        Object.entries(authHeaders).forEach(([key, value]) => {
          headers.set(key, value as string)
        })
      }

      console.log(`URL: ${url}`)
      console.log('Headers:', Object.fromEntries(headers.entries()))

      const response = await fetch(url, {
        method: 'GET',
        headers,
        credentials: 'include'
      })

      console.log(`Status: ${response.status} ${response.statusText}`)
      console.log(`Redirected: ${response.redirected}`)
      console.log(`Final URL: ${response.url}`)

      const contentType = response.headers.get('content-type') || ''
      console.log(`Content-Type: ${contentType}`)

      if (contentType.includes('json')) {
        const json = await response.json()
        console.log('Response:', json)
      } else {
        const text = await response.text()
        console.log('Response (HTML):', text.slice(0, 500))
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  /**
   * Agregar resultado
   */
  private addResult(result: Omit<DiagnosticResult, 'timestamp'>): void {
    this.results.push({
      timestamp: new Date().toISOString(),
      ...result
    })
  }

  /**
   * Imprimir resumen
   */
  private printSummary(): void {
    console.log('\n' + '='.repeat(80))
    console.log('%c📊 DIAGNOSTIC SUMMARY', 'font-size: 14px; font-weight: bold; color: #0066cc')
    console.log('='.repeat(80))

    const passed = this.results.filter(r => r.status === 'PASS').length
    const failed = this.results.filter(r => r.status === 'FAIL').length
    const warnings = this.results.filter(r => r.status === 'WARNING').length

    console.log(`✅ PASSED: ${passed}`)
    console.log(`❌ FAILED: ${failed}`)
    console.log(`⚠️  WARNINGS: ${warnings}`)

    if (failed > 0) {
      console.log('\n%cFailed tests:', 'color: red; font-weight: bold')
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => {
          console.log(`  - ${r.testName}: ${r.error}`)
        })
    }

    console.log('\n%cNext steps:', 'font-weight: bold')
    console.log('1. Check VITE_API_BASE_URL is correct')
    console.log('2. Verify backend is running and responding')
    console.log('3. Check CORS headers on backend')
    console.log('4. If using ngrok, verify ngrok tunnel is active')
    console.log('5. Check browser DevTools > Network tab for failed requests')

    console.log('\n%cDebug helpers:', 'font-weight: bold')
    console.log('window.__apiDiagnostic.testCustomEndpoint("/api/health")')
    console.log('window.__apiDiagnostic.testCustomEndpoint("/api/contributions/YOUR_TOKEN")')
  }
}

// Exportar instancia única
const apiDiagnostic = new ApiDiagnostic()

// Hacer disponible globalmente en desarrollo
if (import.meta.env.DEV) {
  ;(window as any).__apiDiagnostic = {
    test: () => apiDiagnostic.runFullDiagnostics(),
    testEndpoint: (endpoint: string, token?: string) =>
      apiDiagnostic.testCustomEndpoint(endpoint, token)
  }

  console.log(
    '%c💡 TIP: Run window.__apiDiagnostic.test() to run full diagnostics',
    'color: #0066cc; font-weight: bold; font-size: 12px'
  )
}

export default apiDiagnostic
