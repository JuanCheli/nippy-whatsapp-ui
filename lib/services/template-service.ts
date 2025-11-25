/**
 * Template Service
 * Servicio para crear templates de WhatsApp
 */

import { apiRequest, API_CONFIG } from '../api-config'

/**
 * Tipos de componentes de template según WhatsApp API
 */
export type TemplateComponentType = 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS'

/**
 * Formato de header
 */
export type HeaderFormat = 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT'

/**
 * Categorías de templates según WhatsApp
 */
export type TemplateCategory = 'MARKETING' | 'UTILITY' | 'AUTHENTICATION'

/**
 * Formato de parámetros
 */
export type ParameterFormat = 'indexed' | 'named' | 'positional'

/**
 * Ejemplos para componentes de template
 * IMPORTANTE: 
 * - Para formato POSITIONAL: body_text_named_params = [{"1": "val1"}, {"2": "val2"}]
 * - Para formato NAMED: body_text_named_params = [{"param_name": "name", "example": "val"}]
 * - header_text siempre es array de strings: ["val1", "val2"]
 * 
 * Nota: El backend usa un formato diferente al WhatsApp API oficial
 */
export interface TemplateComponentExample {
  body_text_named_params?: Array<Record<string, string>>  // Para POSITIONAL y NAMED
  header_text?: string[]  // Para parámetros de header
}

/**
 * Botón de template
 */
export interface TemplateButton {
  type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER'
  text: string
  url?: string
  phone_number?: string
}

/**
 * Componente de un template
 */
export interface TemplateComponent {
  type: TemplateComponentType
  text?: string
  format?: HeaderFormat
  example?: TemplateComponentExample
  buttons?: TemplateButton[]
}

/**
 * Request para crear un template
 * Basado en CreateTemplateRequest del backend
 */
export interface CreateTemplateRequest {
  name: string                    // Nombre único (snake_case, sin espacios)
  category: TemplateCategory      // Categoría del template
  language: string                // Código de idioma (ej: en_US, es_MX, es_AR)
  components: TemplateComponent[] // Componentes del template
  parameter_format?: ParameterFormat // Formato de parámetros (indexed o named)
}

/**
 * Response de operaciones con templates
 */
export interface TemplateResponse {
  success: boolean
  message: string
  data?: {
    id?: string
    status?: string
    [key: string]: any
  }
}

/**
 * Servicio para operaciones de templates de WhatsApp
 */
export const TemplateService = {
  /**
   * Crea un nuevo template de WhatsApp
   * POST /api/chatbot/create-template
   * 
   * @param request - Datos del template a crear
   * @returns Promise con la respuesta del backend
   * 
   * @example
   * ```ts
   * const response = await TemplateService.createTemplate({
   *   name: "bienvenida_curso",
   *   category: "MARKETING",
   *   language: "es_MX",
   *   components: [
   *     {
   *       type: "HEADER",
   *       format: "TEXT",
   *       text: "¡Bienvenido a {{course_name}}!"
   *     },
   *     {
   *       type: "BODY",
   *       text: "Hola {{user_name}}, estamos emocionados de tenerte en nuestro curso."
   *     },
   *     {
   *       type: "BUTTONS",
   *       buttons: [
   *         { type: "QUICK_REPLY", text: "Comenzar" }
   *       ]
   *     }
   *   ],
   *   parameter_format: "named"
   * })
   * ```
   */
  async createTemplate(request: CreateTemplateRequest): Promise<TemplateResponse> {
    return apiRequest<TemplateResponse>(
      API_CONFIG.ENDPOINTS.CREATE_TEMPLATE,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    )
  },

  /**
   * Valida el nombre del template
   * Debe ser snake_case sin espacios
   * 
   * @param name - Nombre del template a validar
   * @returns true si el formato es válido
   */
  validateTemplateName(name: string): boolean {
    // Solo letras minúsculas, números y underscores
    const nameRegex = /^[a-z0-9_]+$/
    return nameRegex.test(name)
  },

  /**
   * Valida el código de idioma
   * Formato: [idioma]_[PAÍS] (ej: es_MX, en_US)
   * 
   * @param language - Código de idioma a validar
   * @returns true si el formato es válido
   */
  validateLanguageCode(language: string): boolean {
    // Formato: xx_XX
    const langRegex = /^[a-z]{2}_[A-Z]{2}$/
    return langRegex.test(language)
  },

  /**
   * Extrae parámetros de un texto con formato {{param}}
   * 
   * @param text - Texto con parámetros
   * @returns Array de nombres de parámetros encontrados
   */
  extractParameters(text: string): string[] {
    const paramRegex = /\{\{(\w+)\}\}/g
    const params: string[] = []
    let match

    while ((match = paramRegex.exec(text)) !== null) {
      params.push(match[1])
    }

    return params
  },

  /**
   * Valida que todos los parámetros tengan ejemplos
   * 
   * @param component - Componente a validar
   * @returns true si todos los parámetros tienen ejemplos
   */
  validateComponentExamples(component: TemplateComponent): boolean {
    if (!component.text) return true

    const params = this.extractParameters(component.text)
    
    if (params.length === 0) return true

    if (!component.example) return false

    // Validar según el tipo de componente
    if (component.type === 'HEADER' && component.example.header_text) {
      return component.example.header_text.length >= params.length
    }

    if (component.type === 'BODY' && component.example.body_text_named_params) {
      return component.example.body_text_named_params.length > 0
    }

    return false
  },

  /**
   * Códigos de idioma comunes para templates
   */
  COMMON_LANGUAGES: [
    { code: 'es_MX', name: 'Español (México)' },
    { code: 'es_AR', name: 'Español (Argentina)' },
    { code: 'es_ES', name: 'Español (España)' },
    { code: 'en_US', name: 'English (United States)' },
    { code: 'en_GB', name: 'English (United Kingdom)' },
    { code: 'pt_BR', name: 'Português (Brasil)' },
    { code: 'pt_PT', name: 'Português (Portugal)' },
  ] as const,
}
