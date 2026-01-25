import type { RuntimeEnvPort } from '@/application/ports/RuntimeEnvPort'

export class RuntimeEnvAdapter implements RuntimeEnvPort {
  getOrigin(): string {
    return window.location.origin
  }
}
