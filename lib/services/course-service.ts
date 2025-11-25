/**
 * Course Service
 * Servicio para manejar operaciones relacionadas con cursos
 */

import { apiRequest, API_CONFIG } from '../api-config'

/**
 * Request schema para iniciar un curso
 * Basado en CourseStartRequest del backend
 */
export interface CourseStartRequest {
  course_id: string      // ObjectId del curso en MongoDB
  waChat_id: string      // Número de WhatsApp del usuario (formato internacional)
  user_id: string        // ID del usuario (puede ser cualquier string, no requiere formato UUID)
}

/**
 * Response genérico del backend
 */
export interface CourseStartResponse {
  success: boolean
  message: string
  data?: {
    session_id?: string
    status?: string
    [key: string]: any
  }
}

/**
 * Servicio para operaciones de cursos
 */
export const CourseService = {
  /**
   * Inicia un curso para un usuario
   * POST /api/chatbot/course-start
   * 
   * @param request - Datos del curso a iniciar
   * @returns Promise con la respuesta del backend
   * 
   * @example
   * ```ts
   * const response = await CourseService.startCourse({
   *   course_id: "507f1f77bcf86cd799439011",
   *   waChat_id: "+5493517691441",
   *   user_id: "Juan"  // Acepta cualquier string
   * })
   * ```
   */
  async startCourse(request: CourseStartRequest): Promise<CourseStartResponse> {
    return apiRequest<CourseStartResponse>(
      API_CONFIG.ENDPOINTS.COURSE_START,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    )
  },

  /**
   * Valida el formato de un número de WhatsApp
   * Debe estar en formato internacional sin espacios
   * 
   * @param phone - Número de teléfono a validar
   * @returns true si el formato es válido
   */
  validateWhatsAppNumber(phone: string): boolean {
    // Formato esperado: +[código país][número] o solo dígitos
    // Ejemplos válidos: +5493517691441, 5493517691441
    const phoneRegex = /^\+?[1-9]\d{10,14}$/
    return phoneRegex.test(phone.replace(/\s+/g, ''))
  },

  /**
   * Normaliza un número de WhatsApp al formato esperado por el backend
   * 
   * @param phone - Número de teléfono a normalizar
   * @returns Número normalizado (sin espacios, con +)
   */
  normalizeWhatsAppNumber(phone: string): string {
    // Remover espacios y caracteres especiales
    let normalized = phone.replace(/[\s\-()]/g, '')
    
    // Asegurar que tenga el +
    if (!normalized.startsWith('+')) {
      normalized = '+' + normalized
    }
    
    return normalized
  },

  /**
   * Valida el formato de un ObjectId de MongoDB
   * 
   * @param id - ID a validar
   * @returns true si el formato es válido
   */
  validateObjectId(id: string): boolean {
    // ObjectId de MongoDB es un string hexadecimal de 24 caracteres
    return /^[a-f\d]{24}$/i.test(id)
  },

  /**
   * Valida el formato de un UUID
   * 
   * @param id - UUID a validar
   * @returns true si el formato es válido
   */
  validateUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(id)
  },
}
