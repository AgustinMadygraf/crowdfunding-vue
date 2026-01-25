export interface PerformanceObserverEntry {
  name: string
  responseStatus?: number
}

export interface PerformanceObserverPort {
  observeResourceEntries(
    onEntries: (entries: PerformanceObserverEntry[]) => void
  ): () => void
}
