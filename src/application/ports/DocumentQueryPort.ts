export interface DocumentQueryPort {
  getElementById(id: string): HTMLElement | null
  querySelectorAll(selector: string): NodeListOf<Element>
}
