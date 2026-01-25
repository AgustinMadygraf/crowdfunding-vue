import type { AuthGatewayPort } from '@/application/ports/AuthGateway'

export class RefreshTokenUseCase {
  constructor(private readonly gateway: AuthGatewayPort) {}

  async execute(token: string): Promise<string> {
    return this.gateway.refreshToken(token)
  }
}
