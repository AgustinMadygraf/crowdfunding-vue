/**
 * API configuration helpers
 */

/**
 * Base URL for API calls
 * - Requiere VITE_API_BASE_URL en producción. Ej: https://api.madypack.com.ar
 * - Acepta rutas relativas ("/api") en dev si el proxy las resuelve.
 * - En dev, si no hay variable, cae en localhost con log de advertencia.
 */
export const getApiBaseUrl = (): string => {
	const fromEnv = (import.meta.env.VITE_API_BASE_URL || '').trim()
	const isProd = import.meta.env.PROD

	console.info('[config/api] VITE_API_BASE_URL:', fromEnv || '(vacio)')


	// Permitir rutas relativas tipo "/api" cuando se sirva tras reverse proxy
	if (fromEnv) {
		if (fromEnv.startsWith('/')) {
			if (typeof window === 'undefined') {
				throw new Error('VITE_API_BASE_URL relativo requiere window.location')
			}
			return `${window.location.origin}${fromEnv}`.replace(/\/$/, '')
		}
		return fromEnv.replace(/\/$/, '')
	}

	if (isProd) {
		throw new Error('VITE_API_BASE_URL no está definido. Configura, por ejemplo: https://api.madypack.com.ar')
	}

	if (typeof console !== 'undefined') {
		console.warn('[config/api] VITE_API_BASE_URL no definido. Usando fallback http://localhost:5000 (solo dev)')
	}
	return 'http://localhost:5000'
}

export const API_BASE_URL = getApiBaseUrl()

/**
 * Default fetch timeout (ms)
 */
export const DEFAULT_TIMEOUT_MS = 15000
