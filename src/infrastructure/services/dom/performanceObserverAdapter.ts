import type { PerformanceObserverEntry, PerformanceObserverPort } from '@/application/ports/PerformanceObserverPort'

type PerformanceEntryWithResponseStatus = PerformanceEntry & {
  responseStatus?: number
}

export class PerformanceObserverAdapter implements PerformanceObserverPort {
  observeResourceEntries(
    onEntries: (entries: PerformanceObserverEntry[]) => void
  ): () => void {
    let observer: PerformanceObserver | null = null
    try {
      observer = new PerformanceObserver((list) => {
        const entries = list.getEntries().map((entry) => {
          const withStatus = entry as PerformanceEntryWithResponseStatus
          return {
          name: entry.name,
          responseStatus:
            typeof withStatus.responseStatus === 'number' ? withStatus.responseStatus : undefined
          }
        })
        onEntries(entries)
      })
      observer.observe({ entryTypes: ['resource'] })
    } catch {
      return () => undefined
    }

    return () => observer?.disconnect()
  }
}
