/**
 * API Configuration
 * Configuración central para todas las llamadas al backend
 */

// URL base del backend - cambiar según el entorno
const getBaseURL = () => {
  // En desarrollo local
  if (process.env.NODE_ENV === 'development') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  }
  
  // En producción (AWS App Runner o donde esté desplegado)
  return process.env.NEXT_PUBLIC_API_URL || 'https://your-production-api.com'
}

export const API_CONFIG = {
  BASE_URL: getBaseURL(),
  ENDPOINTS: {
    // Chatbot endpoints
    COURSE_START: '/api/chatbot/course-start',
    CREATE_TEMPLATE: '/api/chatbot/create-template',
    WEBHOOK: '/api/chatbot/course-response',
    
    // Monitoring endpoints
    QUEUE_STATS: '/api/chatbot/queue-stats',
    QUEUE_HEALTH: '/api/chatbot/queue-health',
    CACHE_STATS: '/api/chatbot/cache-stats',
  },
  TIMEOUT: 30000, // 30 segundos
}

/**
 * Headers comunes para todas las requests
 */
export const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
})

/**
 * Manejo de errores de API
 */
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

/**
 * Helper para hacer requests con manejo de errores
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`
  
  console.log('\n🌐 === API REQUEST ===')
  console.log('📍 URL:', url)
  console.log('🔧 Method:', options.method || 'GET')
  
  // Parsear el body para logging SIN modificarlo
  let parsedBody = undefined
  if (options.body) {
    try {
      parsedBody = JSON.parse(options.body as string)
      console.log('📦 Body (parsed for logging):', JSON.stringify(parsedBody, null, 2))
      
      // Validación específica para templates
      if (parsedBody.components && Array.isArray(parsedBody.components)) {
        parsedBody.components.forEach((comp: any, idx: number) => {
          if (comp.type === 'BODY' && comp.example) {
            console.log(`   🔍 Componente ${idx} (${comp.type}):`)
            console.log(`      - example.body_text_named_params:`, comp.example.body_text_named_params)
            console.log(`      - Es Array?`, Array.isArray(comp.example.body_text_named_params))
            console.log(`      - Longitud:`, comp.example.body_text_named_params?.length)
          }
        })
      }
    } catch (e) {
      console.log('📦 Body (raw):', options.body)
    }
  }
  
  console.log('📦 Body (string que se enviará):', options.body)
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  }

  try {
    console.log('⏳ Enviando request...')
    const response = await fetch(url, config)
    
    console.log('📥 Respuesta recibida:')
    console.log('  - Status:', response.status, response.statusText)
    console.log('  - OK:', response.ok)
    console.log('  - Headers:', Object.fromEntries(response.headers.entries()))
    
    // Si la respuesta no es OK, lanzar error
    if (!response.ok) {
      console.error('❌ Respuesta con error')
      let errorData: any = {}
      
      try {
        const responseText = await response.text()
        console.error('📄 Response Text:', responseText)
        
        // Intentar parsear como JSON
        if (responseText) {
          errorData = JSON.parse(responseText)
          console.error('📋 Error Data (parsed):', errorData)
        }
      } catch (parseError) {
        console.error('⚠️ No se pudo parsear la respuesta como JSON:', parseError)
      }
      
      const apiError = new APIError(
        errorData.message || errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      )
      
      console.error('🔴 APIError creado:', {
        message: apiError.message,
        status: apiError.status,
        data: apiError.data
      })
      
      throw apiError
    }
    
    // Parsear respuesta JSON
    console.log('✅ Respuesta exitosa, parseando JSON...')
    const data = await response.json()
    console.log('📊 Data recibida:', data)
    console.log('=== FIN API REQUEST ===\n')
    
    return data as T
    
  } catch (error) {
    console.error('\n🔴 === ERROR EN API REQUEST ===')
    console.error('URL:', url)
    console.error('Error:', error)
    
    // Si es un APIError, re-lanzarlo
    if (error instanceof APIError) {
      console.error('Es un APIError, re-lanzando...')
      console.error('=== FIN ERROR ===\n')
      throw error
    }
    
    // Si es un error de red u otro, envolverlo
    console.error('Error de red u otro tipo')
    const networkError = new APIError(
      error instanceof Error ? error.message : 'Error de red desconocido',
      undefined,
      error
    )
    console.error('NetworkError creado:', networkError)
    console.error('=== FIN ERROR ===\n')
    
    throw networkError
  }
}
