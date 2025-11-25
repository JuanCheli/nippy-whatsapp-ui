/**
 * API Services - Exportación central
 * Re-exporta todos los servicios de API
 */

export * from './course-service'
export * from './template-service'

// Exportar también la configuración de API
export { API_CONFIG, APIError, apiRequest } from '../api-config'
