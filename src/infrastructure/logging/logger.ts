type LogArgs = unknown[]
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const isDev = import.meta.env.DEV

export interface LogEventPayload {
  code: string
  context: string
  safeDetails?: Record<string, unknown>
}

function write(method: LogLevel, ...args: LogArgs): void {
  if (!isDev) {
    return
  }

  if (method === 'info') {
    console.log(...args)
    return
  }

  console[method](...args)
}

export const logger = {
  event: (level: LogLevel, event: LogEventPayload) => {
    write(level, `[${event.code}] ${event.context}`, event.safeDetails ?? {})
  },
  debug: (...args: LogArgs) => write('debug', ...args),
  info: (...args: LogArgs) => write('info', ...args),
  warn: (...args: LogArgs) => write('warn', ...args),
  error: (...args: LogArgs) => write('error', ...args)
}
