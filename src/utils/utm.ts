import { Logger } from '@/infrastructure/logger'

/**
 * UTM Parameters Utility
 * Maneja la captura y recuperación de parámetros UTM desde sessionStorage
 * Según NFR-MKT-001
 */

export interface UTMParams {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  campaign_id?: string
  referrer?: string
}

/**
 * Recupera los parámetros UTM capturados en sessionStorage
 * @returns Objeto con parámetros UTM o null si no hay
 */
export const getUTMFromSessionStorage = (): UTMParams | null => {
  try {
    const utmData = sessionStorage.getItem('utm_params')
    if (!utmData) return null

    return JSON.parse(utmData) as UTMParams
  } catch (error) {
    console.error('Error parsing UTM params from sessionStorage:', error)
    return null
  }
}

/**
 * Obtiene la fecha de captura de los parámetros UTM
 * @returns ISO string de la fecha de captura o null
 */
export const getUTMCapturedAt = (): string | null => {
  return sessionStorage.getItem('utm_captured_at')
}

/**
 * Limpia los parámetros UTM del sessionStorage
 * Útil después de completar una suscripción
 */
export const clearUTMParams = (): void => {
  sessionStorage.removeItem('utm_params')
  sessionStorage.removeItem('utm_captured_at')
}

/**
 * Verifica si hay parámetros UTM capturados
 * @returns true si hay parámetros UTM en sessionStorage
 */
export const hasUTMParams = (): boolean => {
  return sessionStorage.getItem('utm_params') !== null
}

/**
 * Parsea los parámetros UTM de una URL
 * @param url URL con parámetros UTM
 * @returns Objeto con parámetros UTM
 */
export function parseUtmParams(url: string) {
  try {
    const urlParams = new URLSearchParams(url)
    const getOrUndefined = (key: string): string | undefined => {
      const value = urlParams.get(key)
      return value === null ? undefined : value
    }
    const utmParams: UTMParams = {
      utm_source: getOrUndefined('utm_source'),
      utm_medium: getOrUndefined('utm_medium'),
      utm_campaign: getOrUndefined('utm_campaign'),
      utm_term: getOrUndefined('utm_term'),
      utm_content: getOrUndefined('utm_content'),
      campaign_id: getOrUndefined('campaign_id'),
      referrer: getOrUndefined('referrer'),
    }
    return utmParams
  } catch (error) {
    Logger.error('Error parseando UTM params', error)
    throw error
  }
}
