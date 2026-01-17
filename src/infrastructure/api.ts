/**
 * API Client Configuration
 * Base HTTP client para todas las llamadas al backend
 */

import { API_BASE_URL, DEFAULT_TIMEOUT_MS } from '@/config/api'
import { csrfService } from './services/csrfService'


export interface ApiResponse<T> {
  data: T
  status: number
  message?: string
}

export interface ApiError {
  status: number
  message: string
  errors?: Record<string, string[]>
}

/**
 * Custom error class para errores de API
 */
export class ApiException extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: Record<string, string[]>
  ) {
    super(message)
    this.name = 'ApiException'
  }
}

/**
 * Cliente HTTP base con fetch
 * Maneja headers, errores y transformación de respuestas
 */
class ApiClient {
  // Interceptor de refresh token: si una request devuelve 401, intenta refrescar y reintenta una vez
  private async fetchWithRefresh<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof ApiException && error.status === 401) {
        // Intentar refresh
        try {
          await this.refreshToken();
          // Reintentar la request original una vez
          return await fn();
        } catch (refreshError) {
          // Si el refresh falla, propagar el error original
          throw error;
        }
      }
      throw error;
    }
  }

  // Llama al endpoint de refresh token
  private async refreshToken(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!response.ok) {
      throw new ApiException(response.status, 'No se pudo refrescar el token');
    }
    // No es necesario procesar el body, las cookies se actualizan automáticamente
  }
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  /**
   * Headers por defecto para todas las requests
   */
  private getDefaultHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }
  }

  /**
   * Headers para requests que modifican estado (POST, PUT, PATCH, DELETE)
   * Incluye el token CSRF si está disponible
   */
  private getMutatingHeaders(): HeadersInit {
    const headers = { ...this.getDefaultHeaders() }
    const csrfToken = csrfService.getToken()
    
    if (csrfToken) {
      Object.assign(headers, csrfService.getTokenHeader(csrfToken, 'X-CSRF-Token'))
      if (import.meta.env.DEV) {
      }
    } else if (import.meta.env.DEV) {
      console.warn('[ApiClient] ⚠️ Token CSRF no disponible para operación de mutación')
    }

    return headers
  }

  /**
   * Reintenta una operación con backoff exponencial
   * Espera: 1s, 2s, 4s entre intentos
   * @param fn Función a ejecutar
   * @param maxAttempts Número máximo de intentos (default: 3)
   * @returns Resultado de la función
   * @throws ApiException si falla después de todos los intentos
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3
  ): Promise<T> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        
        // Si es el último intento o error no recuperable, lanzar
        if (attempt === maxAttempts - 1) {
          throw error
        }

        // Solo reintentar en errores de red o 5xx (no en 4xx)
        if (error instanceof ApiException && error.status >= 400 && error.status < 500) {
          throw error // No reintentar errores de cliente
        }

        // Esperar con backoff exponencial: 1s, 2s, 4s
        const delayMs = Math.pow(2, attempt) * 1000
        if (import.meta.env.DEV) {
        }
        await new Promise(resolve => setTimeout(resolve, delayMs))
      }
    }

    // Este código nunca se ejecuta, pero TypeScript lo requiere
    throw lastError || new Error('Retry exhausted')
  }

  /**
   * Manejo centralizado de errores HTTP
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorData: ApiError
      try {
        errorData = await response.json()
      } catch {
        errorData = {
          status: response.status,
          message: response.statusText || 'Error desconocido'
        }
      }

      throw new ApiException(errorData.status, errorData.message, errorData.errors)
    }

    // Si la respuesta es 204 No Content, retornar null
    if (response.status === 204) {
      return null as T
    }

    return response.json()
  }

  /**
   * GET request con retry automático
   */
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    return this.fetchWithRefresh(() => this._get<T>(endpoint, params));
  }

  private async _get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    return this.retryWithBackoff(async () => {
      const url = new URL(`${this.baseUrl}${endpoint}`)
      if (params) {
        Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value))
      }
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getDefaultHeaders(),
        signal: controller.signal,
        credentials: 'include'
      });
      clearTimeout(timeout)
      return this.handleResponse<T>(response)
    })
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.fetchWithRefresh(() => this._post<T>(endpoint, data));
  }

  private async _post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.retryWithBackoff(async () => {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.getMutatingHeaders(),
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
        credentials: 'include'
      });
      clearTimeout(timeout)
      return this.handleResponse<T>(response)
    })
  }

  /**
   * POST request con retry automático
   */
  // ...existing code...

  /* Incluye token CSRF automáticamente
   */
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.fetchWithRefresh(() => this._put<T>(endpoint, data));
  }

  private async _put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.retryWithBackoff(async () => {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: this.getMutatingHeaders(),
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
        credentials: 'include'
      });
      clearTimeout(timeout)
      return this.handleResponse<T>(response)
    })
  }

  /* Incluye token CSRF automáticamente
   */
  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.fetchWithRefresh(() => this._patch<T>(endpoint, data));
  }

  private async _patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.retryWithBackoff(async () => {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PATCH',
        headers: this.getMutatingHeaders(),
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
        credentials: 'include'
      });
      clearTimeout(timeout)
      return this.handleResponse<T>(response)
    })
  }

  /* Incluye token CSRF automáticamente
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.fetchWithRefresh(() => this._delete<T>(endpoint));
  }

  private async _delete<T>(endpoint: string): Promise<T> {
    return this.retryWithBackoff(async () => {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: this.getMutatingHeaders(),
        signal: controller.signal,
        credentials: 'include'
      });
      clearTimeout(timeout)
      return this.handleResponse<T>(response)
    })
  }
}

// Interceptor de errores globales
// ...existing code...

/**
 * Instancia singleton del cliente API
 */
export const apiClient = new ApiClient(API_BASE_URL)

/**
 * Helper para construir query strings
 */
export const buildQueryString = (params: Record<string, string | number | boolean>): string => {
  const filtered = Object.entries(params).filter(([, value]) => value !== undefined && value !== null)
  const queryString = new URLSearchParams(
    filtered.map(([key, value]) => [key, String(value)])
  ).toString()
  return queryString ? `?${queryString}` : ''
}
