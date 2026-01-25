import type { User } from '@/domain/user'
import type { AuthGatewayPort } from '@/application/ports/AuthGateway'

export interface LoginWithGoogleResult {
  user: User
  authToken: string
}

export class LoginWithGoogleUseCase {
  constructor(private readonly gateway: AuthGatewayPort) {}

  async execute(token: string): Promise<LoginWithGoogleResult> {
    const data = await this.gateway.loginWithGoogle(token)

    const user: User = {
      id: data.user_id,
      email: data.email,
      nombre: data.nombre,
      avatar_url: data.avatar_url
    }

    return { user, authToken: data.auth_token }
  }
}
