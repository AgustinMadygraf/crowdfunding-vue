export interface AuthGatewayResponse {
  user_id: string
  email: string
  nombre: string
  avatar_url?: string
  auth_token: string
}

export interface AuthGatewayPort {
  loginWithGoogle(token: string): Promise<AuthGatewayResponse>
  refreshToken(token: string): Promise<string>
}
