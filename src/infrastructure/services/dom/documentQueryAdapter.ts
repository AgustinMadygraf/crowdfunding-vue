import type { DocumentQueryPort } from '@/application/ports/DocumentQueryPort'

export class DocumentQueryAdapter implements DocumentQueryPort {
  getElementById(id: string): HTMLElement | null {
    return document.getElementById(id)
  }

  querySelectorAll(selector: string): NodeListOf<Element> {
    return document.querySelectorAll(selector)
  }
}
