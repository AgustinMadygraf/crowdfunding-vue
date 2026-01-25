import type { AuthGatewayPort, AuthGatewayResponse } from '@/application/ports/AuthGateway'

export class HttpAuthGateway implements AuthGatewayPort {
  constructor(private readonly apiBaseUrl: string) {}

  async loginWithGoogle(token: string): Promise<AuthGatewayResponse> {
    const response = await fetch(`${this.apiBaseUrl}/api/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    }).catch((fetchError) => {
      throw new Error(`No se pudo conectar al servidor: ${fetchError instanceof Error ? fetchError.message : 'Error desconocido'}`)
    })

    if (!response.ok) {
      const statusError = `HTTP ${response.status}: ${response.statusText}`
      throw new Error(`Error de autenticacion: ${statusError}`)
    }

    const data = (await response.json()) as AuthGatewayResponse
    if (!data.user_id || !data.email || !data.auth_token) {
      throw new Error('Respuesta del servidor incompleta')
    }

    return data
  }

  async refreshToken(token: string): Promise<string> {
    const response = await fetch(`${this.apiBaseUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ token })
    }).catch((fetchError) => {
      throw new Error(`No se pudo conectar al servidor: ${fetchError instanceof Error ? fetchError.message : 'Error desconocido'}`)
    })

    if (!response.ok) {
      throw new Error(`Refresh fallo: ${response.status}`)
    }

    const data = (await response.json()) as { auth_token?: string }
    if (!data.auth_token || data.auth_token.trim() === '') {
      throw new Error('Token de refresh invalido')
    }

    return data.auth_token
  }
}
