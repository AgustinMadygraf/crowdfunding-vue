import type { DocumentDTO } from '@/infrastructure/dto'
import { getAppConfig } from '@/config/appConfig'
import { logger } from '@/infrastructure/logging/logger'

export interface GetDocumentsParams {
  category?: string
}

export class DocumentRepositoryError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message)
    this.name = 'DocumentRepositoryError'
  }
}

export class DocumentsRepository {
  private readonly apiBaseUrl: string

  constructor(apiBaseUrl?: string) {
    this.apiBaseUrl = apiBaseUrl || getAppConfig().apiBaseUrl
  }

  private extractErrorMessage(errorData: unknown): string | null {
    if (typeof errorData === 'string' && errorData.trim()) return errorData

    if (errorData && typeof errorData === 'object' && 'message' in errorData) {
      const value = (errorData as { message?: unknown }).message
      if (typeof value === 'string' && value.trim()) return value
    }

    return null
  }

  async getAll(params?: GetDocumentsParams): Promise<DocumentDTO[]> {
    const queryParams = new URLSearchParams()
    if (params?.category) queryParams.set('category', params.category)

    const queryString = queryParams.toString()
    const url = `${this.apiBaseUrl}/api/documents${queryString ? `?${queryString}` : ''}`

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        let errorData: unknown = {}
        try {
          errorData = await response.json()
        } catch {
          const text = await response.text()
          errorData = { message: text || response.statusText }
        }

        logger.event('error', {
          code: 'DOC_REPO_HTTP_ERROR',
          context: 'Error HTTP al obtener documentos',
          safeDetails: { status: response.status }
        })

        throw new DocumentRepositoryError(
          this.extractErrorMessage(errorData) || `HTTP ${response.status}`,
          response.status,
          errorData
        )
      }

      const data = await response.json()
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.documents)
            ? data.documents
            : null

      if (!list) {
        logger.event('error', {
          code: 'DOC_REPO_INVALID_FORMAT',
          context: 'Formato de respuesta invalido para documentos'
        })
        throw new DocumentRepositoryError('Formato de respuesta invalido para documents')
      }

      return list
    } catch (error) {
      if (error instanceof DocumentRepositoryError) throw error

      logger.event('error', {
        code: 'DOC_REPO_CONNECTION_ERROR',
        context: 'Error de conexion al obtener documentos'
      })

      throw new DocumentRepositoryError(
        `No se pudo conectar: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        undefined,
        error
      )
    }
  }

  async getById(id: number): Promise<DocumentDTO> {
    const url = `${this.apiBaseUrl}/api/documents/${id}`

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new DocumentRepositoryError('Documento no encontrado', 404)
        }

        throw new DocumentRepositoryError(
          `Error al obtener documento: HTTP ${response.status}`,
          response.status
        )
      }

      const document: DocumentDTO = await response.json()
      return document
    } catch (error) {
      if (error instanceof DocumentRepositoryError) throw error

      logger.event('error', {
        code: 'DOC_REPO_GET_BY_ID_ERROR',
        context: 'Error al obtener documento por ID',
        safeDetails: { id }
      })

      throw new DocumentRepositoryError(
        error instanceof Error ? error.message : 'Error desconocido'
      )
    }
  }
}

export const documentsRepository = new DocumentsRepository()
