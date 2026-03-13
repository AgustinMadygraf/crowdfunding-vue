import type { LoggerPort } from './LoggerPort'

const noopLogger: LoggerPort = {
  event: () => {},
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {}
}

let logger: LoggerPort = noopLogger

export function setLogger(value: LoggerPort): void {
  logger = value
}

export function getLogger(): LoggerPort {
  return logger
}
