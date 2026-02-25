type LogArgs = unknown[]

const isDev = import.meta.env.DEV

function write(method: 'info' | 'warn' | 'error' | 'debug', ...args: LogArgs): void {
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
  debug: (...args: LogArgs) => write('debug', ...args),
  info: (...args: LogArgs) => write('info', ...args),
  warn: (...args: LogArgs) => write('warn', ...args),
  error: (...args: LogArgs) => write('error', ...args)
}
