/**
 * Barrel export para infrastructure/http
 */

export { HttpClient, createHttpClient, HttpClientError } from './HttpClient'
export type { HttpClientOptions, RequestOptions, HttpError } from './HttpClient'

export { ApiConfig, getApiConfig, resetApiConfig } from './ApiConfig'
export type { ApiEndpoints, ApiConfigOptions } from './ApiConfig'

export { ResponseValidator, createJsonValidator, createTextValidator, ResponseValidationError } from './ResponseValidator'
export type { ValidationError, ValidationErrorDetails } from './ResponseValidator'
