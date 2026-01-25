export interface GoogleConfigInfo {
  configured: boolean
  clientIdPrefix: string
}

export class GetGoogleConfigInfoUseCase {
  execute(clientId: string): GoogleConfigInfo {
    const configured = !!clientId && clientId.trim() !== ''
    return {
      configured,
      clientIdPrefix: configured ? `${clientId.substring(0, 20)}...` : 'NO CONFIGURADO'
    }
  }
}
