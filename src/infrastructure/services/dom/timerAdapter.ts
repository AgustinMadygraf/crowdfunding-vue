import type { TimerPort } from '@/application/ports/TimerPort'

export class TimerAdapter implements TimerPort {
  setTimeout(callback: () => void, delayMs: number): number {
    return window.setTimeout(callback, delayMs)
  }

  clearTimeout(id: number): void {
    window.clearTimeout(id)
  }
}
