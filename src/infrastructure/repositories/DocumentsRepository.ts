/**
 * Repository: Documents (Documentos)
 * Encapsula toda la lógica de acceso a datos de documentos públicos
 */

import type { DocumentDTO } from '@/infrastructure/dto'
import { getAppConfig } from '@/config/appConfig'

export interface GetDocumentsParams {
  category?: string
}

/**
 * Excepción personalizada para errores del repositorio
 */
export class DocumentRepositoryError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message)
    this.name = 'DocumentRepositoryError'
  }
}

/**
 * Repository de documentos
 * Abstrae la lógica de acceso al backend
 */
export class DocumentsRepository {
  private readonly apiBaseUrl: string

  constructor(apiBaseUrl?: string) {
    this.apiBaseUrl = apiBaseUrl || getAppConfig().apiBaseUrl
  }

  /**
   * Obtiene todos los documentos publicados
   */
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
        let errorData: any = {}
        try {
          errorData = await response.json()
        } catch {
          const text = await response.text()
          errorData = { message: text || response.statusText }
        }

        console.error('[DocumentsRepository] ❌ Error HTTP', response.status)
        console.error('[DocumentsRepository] Respuesta:', errorData)

        throw new DocumentRepositoryError(
          errorData.message || `HTTP ${response.status}`,
          response.status,
          errorData
        )
      }

      const data = await response.json()

      // Normalizar respuesta: aceptar array directo, {data: [...]}, o {documents: [...]}
      const list = Array.isArray(data) 
        ? data 
        : Array.isArray(data?.data) 
          ? data.data 
          : Array.isArray(data?.documents)
            ? data.documents
            : null

      if (!list) {
        console.error('[DocumentsRepository] ❌ Formato de respuesta inválido:', data)
        throw new DocumentRepositoryError('Formato de respuesta inválido para documents')
      }
      return list
    } catch (error) {
      if (error instanceof DocumentRepositoryError) {
        throw error
      }

      console.error('[DocumentsRepository] ❌ Error de conexión:', error)
      throw new DocumentRepositoryError(
        `No se pudo conectar: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        undefined,
        error
      )
    }
  }

  /**
   * Obtiene un documento específico por ID
   */
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
      if (error instanceof DocumentRepositoryError) {
        throw error
      }

      console.error('[DocumentsRepository] ❌ Error al obtener documento:', error)
      throw new DocumentRepositoryError(
        error instanceof Error ? error.message : 'Error desconocido'
      )
    }
  }
}

// Instancia singleton por conveniencia
export const documentsRepository = new DocumentsRepository()
