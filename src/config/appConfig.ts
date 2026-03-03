export type AuthMode = 'session' | 'cookie'

export type AppConfig = {
  apiBaseUrl: string
  siteUrl: string
  googleClientId: string
  authMode: AuthMode
}

const resolveApiBaseUrl = (): string => {
  const fromEnv = (import.meta.env.VITE_API_BASE_URL || '').trim()
  const isProd = import.meta.env.PROD

  if (fromEnv) {
    if (fromEnv.startsWith('/')) {
      if (typeof window === 'undefined') {
        throw new Error('VITE_API_BASE_URL relative path requires window.location')
      }
      return `${window.location.origin}${fromEnv}`.replace(/\/$/, '')
    }
    return fromEnv.replace(/\/$/, '')
  }

  if (isProd) {
    throw new Error(
      'VITE_API_BASE_URL is not defined. Set it at build time, e.g. https://api.example.com'
    )
  }

  return 'http://localhost:5000'
}

const resolveSiteUrl = (): string => {
  return (import.meta.env.VITE_SITE_URL as string) || window.location.origin
}

const resolveGoogleClientId = (): string => {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
}

const resolveAuthMode = (): AuthMode => {
  const value = ((import.meta.env.VITE_AUTH_MODE as string | undefined) || '').trim().toLowerCase()
  if (value === 'cookie') return 'cookie'
  return 'session'
}

let cachedConfig: AppConfig | null = null

export const getAppConfig = (): AppConfig => {
  if (!cachedConfig) {
    cachedConfig = {
      apiBaseUrl: resolveApiBaseUrl(),
      siteUrl: resolveSiteUrl(),
      googleClientId: resolveGoogleClientId(),
      authMode: resolveAuthMode()
    }
  }

  return cachedConfig
}
