import { describe, expect, it } from 'vitest'
import {
  isExternalLinkSafe,
  isUrlSafe,
  sanitizeAvatarUrl,
  sanitizeExternalLink,
  sanitizeUrl
} from '@/utils/urlSanitizer'

describe('urlSanitizer', () => {
  it('bloquea esquemas peligrosos en avatars', () => {
    expect(isUrlSafe('javascript:alert(1)')).toBe(false)
    expect(sanitizeAvatarUrl('javascript:alert(1)')).toContain('data:image/svg+xml')
  })

  it('permite dominios de avatar confiables', () => {
    const url = 'https://lh3.googleusercontent.com/a/test-avatar'
    expect(isUrlSafe(url)).toBe(true)
    expect(sanitizeUrl(url)).toBe(url)
  })

  it('bloquea enlaces externos activos', () => {
    expect(isExternalLinkSafe('data:text/html;base64,AAAA')).toBe(false)
    expect(isExternalLinkSafe('vbscript:evil()')).toBe(false)
    expect(sanitizeExternalLink('javascript:alert(1)')).toBeNull()
  })

  it('permite enlaces externos http/https', () => {
    expect(isExternalLinkSafe('https://example.org/path')).toBe(true)
    expect(sanitizeExternalLink('https://example.org/path')).toBe('https://example.org/path')
  })
})
