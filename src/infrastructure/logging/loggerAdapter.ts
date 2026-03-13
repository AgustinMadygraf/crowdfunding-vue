import type { LoggerPort } from '@/application/ports/LoggerPort'
import { logger } from './logger'

export const loggerAdapter: LoggerPort = {
  event: (level, event) => logger.event(level, event),
  debug: (...args) => logger.debug(...args),
  info: (...args) => logger.info(...args),
  warn: (...args) => logger.warn(...args),
  error: (...args) => logger.error(...args)
}
