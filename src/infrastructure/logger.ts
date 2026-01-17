// Centralized logger

export class Logger {
  static info(message: string, ...args: unknown[]) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.info('[INFO]', message, ...args)
    }
  }

  static warn(message: string, ...args: unknown[]) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn('[WARN]', message, ...args)
    }
  }

  static error(message: string, error?: unknown, ...args: unknown[]) {
    // eslint-disable-next-line no-console
    console.error('[ERROR]', message, error, ...args)
  }

  static log(message: string, ...args: unknown[]) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('[LOG]', message, ...args)
    }
  }

}

// Example usage:
// Logger.info('User logged in', user)
// Logger.error('API failed', err)
