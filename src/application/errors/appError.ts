export type AppErrorType =
  | 'AUTH'
  | 'NETWORK'
  | 'NOT_FOUND'
  | 'SERVER'
  | 'VALIDATION'
  | 'UNKNOWN'

export interface AppErrorOptions {
  message: string
  type?: AppErrorType
  code?: string
  statusCode?: number
  safeDetails?: Record<string, unknown>
}

export class AppError extends Error {
  readonly type: AppErrorType
  readonly code: string
  readonly statusCode?: number
  readonly safeDetails?: Record<string, unknown>

  constructor(options: AppErrorOptions) {
    super(options.message)
    this.name = 'AppError'
    this.type = options.type ?? 'UNKNOWN'
    this.code = options.code ?? 'APP_UNKNOWN'
    this.statusCode = options.statusCode
    this.safeDetails = options.safeDetails
  }
}
