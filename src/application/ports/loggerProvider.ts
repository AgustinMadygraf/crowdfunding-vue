import type { LoggerPort } from './LoggerPort'

let logger: LoggerPort | null = null

export function setLogger(value: LoggerPort): void {
  logger = value
}

export function getLogger(): LoggerPort {
  if (!logger) {
    throw new Error('Logger not configured')
  }
  return logger
}
