export function normalizeErrorMessage(
  err: unknown,
  fallback: string = 'Error desconocido'
): string {
  if (err instanceof Error && err.message.trim()) {
    return err.message
  }

  return fallback
}
