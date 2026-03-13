type LogArgs = unknown[]
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const isDev = import.meta.env.DEV
const isVerbose =
  isDev && (import.meta.env.VITE_DEBUG_HTTP === 'true' || import.meta.env.VITE_DEBUG_LOGS === 'true')
const DEDUPE_WINDOW_MS = 3000
const lastLogByKey = new Map<string, number>()

export interface LogEventPayload {
  code: string
  context: string
  safeDetails?: Record<string, unknown>
}

function shouldSkipByLevel(method: LogLevel): boolean {
  return (method === 'debug' || method === 'info') && !isVerbose
}

function stableSerialize(arg: unknown): string {
  if (typeof arg === 'string') return arg
  try {
    return JSON.stringify(arg)
  } catch {
    return String(arg)
  }
}

function shouldDedupe(method: LogLevel, args: LogArgs): boolean {
  if (method === 'debug' || method === 'info') {
    return false
  }
  const key = `${method}:${args.map(stableSerialize).join('|')}`
  const now = Date.now()
  const last = lastLogByKey.get(key)
  if (last && now - last < DEDUPE_WINDOW_MS) {
    return true
  }
  lastLogByKey.set(key, now)
  return false
}

function write(method: LogLevel, ...args: LogArgs): void {
  if (!isDev) {
    return
  }
  if (shouldSkipByLevel(method)) {
    return
  }
  if (shouldDedupe(method, args)) {
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
