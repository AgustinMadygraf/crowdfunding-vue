export interface TimerPort {
  setTimeout(callback: () => void, delayMs: number): number
  clearTimeout(id: number): void
}
