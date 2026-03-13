export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEventPayload {
  code: string
  context: string
  safeDetails?: Record<string, unknown>
}

export interface LoggerPort {
  event(level: LogLevel, event: LogEventPayload): void
  debug(...args: unknown[]): void
  info(...args: unknown[]): void
  warn(...args: unknown[]): void
  error(...args: unknown[]): void
}
