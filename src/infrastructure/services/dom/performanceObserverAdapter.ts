import type { PerformanceObserverEntry, PerformanceObserverPort } from '@/application/ports/PerformanceObserverPort'

export class PerformanceObserverAdapter implements PerformanceObserverPort {
  observeResourceEntries(
    onEntries: (entries: PerformanceObserverEntry[]) => void
  ): () => void {
    let observer: PerformanceObserver | null = null
    try {
      observer = new PerformanceObserver((list) => {
        const entries = list.getEntries().map((entry) => ({
          name: entry.name,
          responseStatus: (entry as any).responseStatus
        }))
        onEntries(entries)
      })
      observer.observe({ entryTypes: ['resource'] })
    } catch {
      return () => undefined
    }

    return () => observer?.disconnect()
  }
}
