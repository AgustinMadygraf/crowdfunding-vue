/**
 * API configuration helpers
 */

/**
 * Base URL for API calls
 */
export const getApiBaseUrl = (): string => import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
export const API_BASE_URL = getApiBaseUrl()

/**
 * Default fetch timeout (ms)
 */
export const DEFAULT_TIMEOUT_MS = 15000
