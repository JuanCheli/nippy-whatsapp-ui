"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MessageSquare, Send, Users, BookOpen, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { ConfirmationModal } from "@/components/confirmation-modal"
import { CourseService, APIError } from "@/lib/services"
import { useToast } from "@/hooks/use-toast"

interface FormData {
  courseId: string
  phoneNumber: string
  userIds: string[]
}

type SendStatus = 'idle' | 'loading' | 'success' | 'error'

export default function WhatsAppTemplateSender() {
  const [formData, setFormData] = useState<FormData>({
    courseId: "",
    phoneNumber: "",
    userIds: [],
  })
  const [userIdInput, setUserIdInput] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sendStatus, setSendStatus] = useState<SendStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const { toast } = useToast()

  const handleAddUserId = () => {
    if (userIdInput.trim() && !formData.userIds.includes(userIdInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        userIds: [...prev.userIds, userIdInput.trim()],
      }))
      setUserIdInput("")
    }
  }

  const handleRemoveUserId = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      userIds: prev.userIds.filter((id) => id !== userId),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsModalOpen(true)
  }

  const handleConfirm = async () => {
    console.log('=== INICIO DE ENVÍO DE CURSO ===')
    console.log('📋 Datos del formulario:', {
      courseId: formData.courseId,
      phoneNumber: formData.phoneNumber,
      userIds: formData.userIds,
    })
    
    setSendStatus('loading')
    setErrorMessage('')
    
    try {
      // Validar formato de número de WhatsApp
      console.log('🔍 Validando número de WhatsApp...')
      const normalizedPhone = CourseService.normalizeWhatsAppNumber(formData.phoneNumber)
      console.log('📞 Número normalizado:', normalizedPhone)
      
      if (!CourseService.validateWhatsAppNumber(normalizedPhone)) {
        console.error('❌ Validación de número fallida')
        throw new Error('Formato de número de WhatsApp inválido. Use formato internacional (ej: +5493517691441)')
      }
      console.log('✅ Número de WhatsApp válido')

      // Validar ObjectId del curso
      console.log('🔍 Validando ObjectId del curso...')
      if (!CourseService.validateObjectId(formData.courseId)) {
        console.error('❌ Validación de ObjectId fallida')
        throw new Error('El ID del curso debe ser un ObjectId válido de MongoDB (24 caracteres hexadecimales)')
      }
      console.log('✅ ObjectId del curso válido')

      // Enviar para cada usuario
      console.log(`📤 Enviando a ${formData.userIds.length} usuario(s)...`)
      const results = await Promise.allSettled(
        formData.userIds.map(async (userId, index) => {
          console.log(`\n--- Usuario ${index + 1}/${formData.userIds.length} ---`)
          console.log('👤 User ID:', userId)
          
          // Validar que el user_id no esté vacío
          if (!userId || userId.trim() === '') {
            console.error(`❌ user_id vacío para usuario ${index + 1}`)
            throw new Error(`El user_id no puede estar vacío`)
          }
          console.log('✅ user_id válido:', userId)

          const payload = {
            course_id: formData.courseId,
            waChat_id: normalizedPhone,
            user_id: userId.trim(),
          }
          
          console.log('📦 Payload a enviar:', payload)
          
          try {
            const response = await CourseService.startCourse(payload)
            console.log(`✅ Respuesta exitosa para usuario ${index + 1}:`, response)
            return response
          } catch (error) {
            console.error(`❌ Error al enviar para usuario ${index + 1}:`, error)
            if (error instanceof APIError) {
              console.error('  - Status:', error.status)
              console.error('  - Message:', error.message)
              console.error('  - Data:', error.data)
            }
            throw error
          }
        })
      )

      console.log('\n=== RESULTADOS DE ENVÍOS ===')
      console.log('📊 Total de envíos:', results.length)
      
      // Analizar resultados
      const successful = results.filter((r) => r.status === 'fulfilled')
      const failed = results.filter((r) => r.status === 'rejected')
      
      console.log('✅ Exitosos:', successful.length)
      console.log('❌ Fallidos:', failed.length)
      
      // Mostrar detalles de errores
      if (failed.length > 0) {
        console.error('\n🔴 ERRORES DETALLADOS:')
        failed.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`Error ${index + 1}:`, result.reason)
            if (result.reason instanceof APIError) {
              console.error(`  - HTTP Status: ${result.reason.status}`)
              console.error(`  - Message: ${result.reason.message}`)
              console.error(`  - Response Data:`, result.reason.data)
            }
          }
        })
      }

      if (successful.length > 0) {
        console.log('✅ Algunos envíos fueron exitosos')
        setSendStatus('success')
        toast({
          title: "✅ Mensajes enviados",
          description: `${successful.length} mensaje(s) enviado(s) correctamente${failed.length > 0 ? `, ${failed.length} fallido(s)` : ''}`,
        })

        // Resetear formulario después de éxito
        setTimeout(() => {
          setFormData({ courseId: "", phoneNumber: "", userIds: [] })
          setUserIdInput("")
          setSendStatus('idle')
          setIsModalOpen(false)
        }, 2000)
      } else {
        console.error('❌ TODOS LOS ENVÍOS FALLARON')
        // Construir mensaje de error detallado
        const errorDetails = failed.map((result, index) => {
          if (result.status === 'rejected') {
            const error = result.reason
            if (error instanceof APIError) {
              return `Usuario ${index + 1}: ${error.message} (HTTP ${error.status || 'N/A'})`
            }
            return `Usuario ${index + 1}: ${error instanceof Error ? error.message : 'Error desconocido'}`
          }
          return ''
        }).filter(Boolean).join('\n')
        
        throw new Error(`Todos los envíos fallaron:\n${errorDetails}`)
      }

    } catch (error) {
      console.error('\n🔴 ERROR GENERAL:', error)
      console.error('Error completo:', error)
      setSendStatus('error')
      
      const errorMsg = error instanceof APIError 
        ? `${error.message} (HTTP ${error.status || 'N/A'})${error.data ? '\nDetalles: ' + JSON.stringify(error.data, null, 2) : ''}` 
        : error instanceof Error 
        ? error.message 
        : 'Error desconocido al enviar el mensaje'
      
      setErrorMessage(errorMsg)
      
      toast({
        title: "❌ Error al enviar mensaje",
        description: errorMsg,
        variant: "destructive",
      })
    }
    
    console.log('=== FIN DE ENVÍO DE CURSO ===\n')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl">
          {/* Hero Section */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h2 className="mb-3 text-3xl font-bold text-balance text-foreground">Enviar Mensaje de Inicio de Curso</h2>
            <p className="text-lg text-balance text-muted-foreground">
              Envía notificaciones de WhatsApp a múltiples usuarios simultáneamente
            </p>
          </div>

          {/* Form Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Detalles del Mensaje</CardTitle>
              <CardDescription>Complete los campos para enviar el template de WhatsApp</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Course ID */}
                <div className="space-y-2">
                  <Label htmlFor="courseId" className="flex items-center gap-2 text-base">
                    <BookOpen className="h-4 w-4 text-primary" />
                    ID del Curso
                  </Label>
                  <Input
                    id="courseId"
                    type="text"
                    placeholder="Ej: CURSO-2025-001"
                    value={formData.courseId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, courseId: e.target.value }))}
                    required
                    className="h-11"
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="flex items-center gap-2 text-base">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    Número de Teléfono
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="Ej: +56912345678"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                    required
                    className="h-11"
                  />
                  <p className="text-sm text-muted-foreground">Incluir código de país (Ej: +56 para Chile)</p>
                </div>

                {/* User IDs */}
                <div className="space-y-2">
                  <Label htmlFor="userIds" className="flex items-center gap-2 text-base">
                    <Users className="h-4 w-4 text-primary" />
                    IDs de Usuarios
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="userIds"
                      type="text"
                      placeholder="Ingrese User ID"
                      value={userIdInput}
                      onChange={(e) => setUserIdInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddUserId())}
                      className="h-11"
                    />
                    <Button
                      type="button"
                      onClick={handleAddUserId}
                      variant="outline"
                      className="h-11 shrink-0 bg-transparent"
                    >
                      Agregar
                    </Button>
                  </div>

                  {/* Selected User IDs */}
                  {formData.userIds.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-medium text-foreground">
                        Usuarios seleccionados ({formData.userIds.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {formData.userIds.map((userId) => (
                          <div
                            key={userId}
                            className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground"
                          >
                            <span>{userId}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveUserId(userId)}
                              className="ml-1 hover:text-destructive"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 text-base font-semibold"
                  disabled={formData.userIds.length === 0 || sendStatus === 'loading'}
                >
                  {sendStatus === 'loading' ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Enviando...
                    </>
                  ) : sendStatus === 'success' ? (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Enviado exitosamente
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Enviar mensaje de inicio de curso
                    </>
                  )}
                </Button>

                {/* Error Message */}
                {sendStatus === 'error' && errorMessage && (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-destructive">Error al enviar</p>
                        <p className="text-sm text-destructive/90">{errorMessage}</p>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="mt-6 border-secondary/50 bg-secondary/10">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <div className="shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <MessageSquare className="h-5 w-5 text-secondary-foreground" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Información importante</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    El mensaje se enviará a todos los usuarios seleccionados. Asegúrate de verificar los datos antes de
                    confirmar el envío.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        formData={formData}
      />
    </div>
  )
}
