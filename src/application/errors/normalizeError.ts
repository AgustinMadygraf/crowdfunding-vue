import { toAppError } from '@/application/errors/toAppError'

export function normalizeErrorMessage(
  err: unknown,
  fallback: string = 'Error desconocido'
): string {
  return toAppError(err, fallback).message
}
