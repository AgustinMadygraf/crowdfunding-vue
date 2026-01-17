export type AppConfig = {
  apiBaseUrl: string
  siteUrl: string
  googleClientId: string
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

  if (typeof console !== 'undefined') {
    console.warn(
      '[config] VITE_API_BASE_URL not set. Falling back to http://localhost:5000 (dev only)'
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

let cachedConfig: AppConfig | null = null

export const getAppConfig = (): AppConfig => {
  if (!cachedConfig) {
    cachedConfig = {
      apiBaseUrl: resolveApiBaseUrl(),
      siteUrl: resolveSiteUrl(),
      googleClientId: resolveGoogleClientId()
    }
  }

  return cachedConfig
}
