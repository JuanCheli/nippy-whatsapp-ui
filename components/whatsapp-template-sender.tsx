"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MessageSquare, Send, Users, BookOpen } from "lucide-react"
import { ConfirmationModal } from "@/components/confirmation-modal"

interface FormData {
  courseId: string
  phoneNumber: string
  userIds: string[]
}

export default function WhatsAppTemplateSender() {
  const [formData, setFormData] = useState<FormData>({
    courseId: "",
    phoneNumber: "",
    userIds: [],
  })
  const [userIdInput, setUserIdInput] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)

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
    // Aquí iría la lógica para enviar el template de WhatsApp
    console.log("Enviando mensaje de inicio de curso:", formData)

    // Simular envío
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsModalOpen(false)
    // Resetear formulario
    setFormData({ courseId: "", phoneNumber: "", userIds: [] })
    setUserIdInput("")
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
                  disabled={formData.userIds.length === 0}
                >
                  <Send className="mr-2 h-5 w-5" />
                  Enviar mensaje de inicio de curso
                </Button>
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
