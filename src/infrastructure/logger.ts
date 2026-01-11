// Centralized logger and error reporting (Sentry-ready)
import * as Sentry from '@sentry/browser'

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
    Sentry.captureMessage(message, 'warning')
  }

  static error(message: string, error?: unknown, ...args: unknown[]) {
    // eslint-disable-next-line no-console
    console.error('[ERROR]', message, error, ...args)
    Sentry.captureException(error || message)
  }

  static log(message: string, ...args: unknown[]) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('[LOG]', message, ...args)
    }
  }

  static setupSentry(options: Sentry.BrowserOptions) {
    Sentry.init(options)
  }
}

// Example usage:
// Logger.info('User logged in', user)
// Logger.error('API failed', err)
// Logger.setupSentry({ dsn: 'https://xxxx@sentry.io/123' })
