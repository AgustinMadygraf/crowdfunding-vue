let backendOfflineUntil = 0
let lastReason = ''

export function isBackendTemporarilyOffline(): boolean {
  return Date.now() < backendOfflineUntil
}

export function markBackendOffline(reason: string, cooldownMs = 15000): void {
  backendOfflineUntil = Date.now() + cooldownMs
  lastReason = reason
}

export function getBackendOfflineReason(): string {
  return lastReason
}
