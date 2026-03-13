export function isNetworkUnavailableError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false
  }

  const message = error.message.toLowerCase()
  return message.includes('failed to fetch') || message.includes('networkerror')
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
