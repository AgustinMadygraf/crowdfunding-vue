/**
 * API Client Configuration
 * Base HTTP client para todas las llamadas al backend
 */

import { API_BASE_URL, DEFAULT_TIMEOUT_MS } from '@/config/api'

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
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getDefaultHeaders(),
      signal: controller.signal
    }).finally(() => clearTimeout(timeout))

    return this.handleResponse<T>(response)
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getDefaultHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      signal: controller.signal
    }).finally(() => clearTimeout(timeout))

    return this.handleResponse<T>(response)
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getDefaultHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      signal: controller.signal
    }).finally(() => clearTimeout(timeout))

    return this.handleResponse<T>(response)
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers: this.getDefaultHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      signal: controller.signal
    }).finally(() => clearTimeout(timeout))

    return this.handleResponse<T>(response)
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getDefaultHeaders(),
      signal: controller.signal
    }).finally(() => clearTimeout(timeout))

    return this.handleResponse<T>(response)
  }
}

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
