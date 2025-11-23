"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Plus, Trash2, AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface TemplateVariable {
  id: string
  name: string
  example: string
}

interface TemplateData {
  name: string
  category: string
  language: string
  headerText: string
  bodyText: string
  footerText: string
  variables: TemplateVariable[]
}

export default function WhatsAppTemplateCreator() {
  const [templateData, setTemplateData] = useState<TemplateData>({
    name: "",
    category: "MARKETING",
    language: "es",
    headerText: "",
    bodyText: "",
    footerText: "",
    variables: [],
  })

  const [variableName, setVariableName] = useState("")
  const [variableExample, setVariableExample] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleAddVariable = () => {
    if (variableName.trim() && variableExample.trim()) {
      const newVariable: TemplateVariable = {
        id: Date.now().toString(),
        name: variableName.trim(),
        example: variableExample.trim(),
      }
      setTemplateData((prev) => ({
        ...prev,
        variables: [...prev.variables, newVariable],
      }))
      setVariableName("")
      setVariableExample("")
    }
  }

  const handleRemoveVariable = (variableId: string) => {
    setTemplateData((prev) => ({
      ...prev,
      variables: prev.variables.filter((v) => v.id !== variableId),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitSuccess(false)

    // Aquí iría la lógica para crear el template en WhatsApp Business
    console.log("Creando template:", templateData)

    // Simular creación
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setSubmitSuccess(true)

    // Resetear formulario después de 3 segundos
    setTimeout(() => {
      setTemplateData({
        name: "",
        category: "MARKETING",
        language: "es",
        headerText: "",
        bodyText: "",
        footerText: "",
        variables: [],
      })
      setSubmitSuccess(false)
    }, 3000)
  }

  const renderPreview = () => {
    let bodyPreview = templateData.bodyText
    templateData.variables.forEach((variable, index) => {
      bodyPreview = bodyPreview.replace(`{{${index + 1}}}`, `*${variable.example}*`)
    })

    return (
      <div className="space-y-3">
        {templateData.headerText && <div className="font-semibold text-foreground">{templateData.headerText}</div>}
        {templateData.bodyText && (
          <div className="text-sm text-muted-foreground whitespace-pre-wrap">{bodyPreview}</div>
        )}
        {templateData.footerText && <div className="text-xs text-muted-foreground/70">{templateData.footerText}</div>}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Hero Section */}
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
          <FileText className="h-8 w-8 text-accent" />
        </div>
        <h2 className="mb-3 text-3xl font-bold text-balance text-foreground">Crear Template de WhatsApp</h2>
        <p className="text-lg text-balance text-muted-foreground">
          Diseña templates personalizados para tus mensajes de WhatsApp Business
        </p>
      </div>

      {submitSuccess && (
        <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Template creado exitosamente. Será enviado a WhatsApp para aprobación.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Información del Template</CardTitle>
            <CardDescription>Complete los detalles para crear un nuevo template de WhatsApp</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Template Name */}
              <div className="space-y-2">
                <Label htmlFor="templateName" className="text-base">
                  Nombre del Template
                </Label>
                <Input
                  id="templateName"
                  type="text"
                  placeholder="Ej: inicio_curso_2025"
                  value={templateData.name}
                  onChange={(e) => setTemplateData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">Solo letras minúsculas, números y guiones bajos</p>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-base">
                  Categoría
                </Label>
                <Select
                  value={templateData.category}
                  onValueChange={(value) => setTemplateData((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger id="category" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MARKETING">Marketing</SelectItem>
                    <SelectItem value="UTILITY">Utilidad</SelectItem>
                    <SelectItem value="AUTHENTICATION">Autenticación</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Language */}
              <div className="space-y-2">
                <Label htmlFor="language" className="text-base">
                  Idioma
                </Label>
                <Select
                  value={templateData.language}
                  onValueChange={(value) => setTemplateData((prev) => ({ ...prev, language: value }))}
                >
                  <SelectTrigger id="language" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="pt">Português</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Header Text */}
              <div className="space-y-2">
                <Label htmlFor="headerText" className="text-base">
                  Encabezado (Opcional)
                </Label>
                <Input
                  id="headerText"
                  type="text"
                  placeholder="Ej: Bienvenido a tu curso"
                  value={templateData.headerText}
                  onChange={(e) => setTemplateData((prev) => ({ ...prev, headerText: e.target.value }))}
                  className="h-11"
                />
              </div>

              {/* Body Text */}
              <div className="space-y-2">
                <Label htmlFor="bodyText" className="text-base">
                  Cuerpo del Mensaje
                </Label>
                <Textarea
                  id="bodyText"
                  placeholder="Hola {{1}}, tu curso {{2}} inicia el {{3}}. ¡Nos vemos pronto!"
                  value={templateData.bodyText}
                  onChange={(e) => setTemplateData((prev) => ({ ...prev, bodyText: e.target.value }))}
                  required
                  rows={5}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Use {"{{1}}"}, {"{{2}}"}, etc. para variables
                </p>
              </div>

              {/* Footer Text */}
              <div className="space-y-2">
                <Label htmlFor="footerText" className="text-base">
                  Pie de Página (Opcional)
                </Label>
                <Input
                  id="footerText"
                  type="text"
                  placeholder="Ej: Equipo Nippy"
                  value={templateData.footerText}
                  onChange={(e) => setTemplateData((prev) => ({ ...prev, footerText: e.target.value }))}
                  className="h-11"
                />
              </div>

              {/* Variables */}
              <div className="space-y-3">
                <Label className="text-base">Variables del Template</Label>
                <div className="space-y-2">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input
                      placeholder="Nombre (Ej: nombre_alumno)"
                      value={variableName}
                      onChange={(e) => setVariableName(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddVariable())}
                    />
                    <Input
                      placeholder="Ejemplo (Ej: Juan Pérez)"
                      value={variableExample}
                      onChange={(e) => setVariableExample(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddVariable())}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddVariable}
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Variable
                  </Button>
                </div>

                {/* Variables List */}
                {templateData.variables.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      Variables definidas ({templateData.variables.length})
                    </p>
                    <div className="space-y-2">
                      {templateData.variables.map((variable, index) => (
                        <div
                          key={variable.id}
                          className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-mono text-primary">{"{{" + (index + 1) + "}}"}</span>
                              <span className="text-sm font-medium text-foreground">{variable.name}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Ejemplo: {variable.example}</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveVariable(variable.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button type="submit" size="lg" className="w-full h-12 text-base font-semibold" disabled={isSubmitting}>
                <FileText className="mr-2 h-5 w-5" />
                {isSubmitting ? "Creando Template..." : "Crear Template"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Vista Previa</CardTitle>
              <CardDescription>Así se verá tu template en WhatsApp</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border-2 border-border bg-background p-4">
                <div className="mx-auto max-w-sm">
                  <div className="rounded-2xl bg-accent/10 p-4 shadow-sm">
                    {templateData.headerText || templateData.bodyText || templateData.footerText ? (
                      renderPreview()
                    ) : (
                      <p className="text-sm text-muted-foreground text-center">
                        Complete el formulario para ver la vista previa
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="border-secondary/50 bg-secondary/10">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <div className="shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <AlertCircle className="h-5 w-5 text-secondary-foreground" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Proceso de Aprobación</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Los templates de WhatsApp Business requieren aprobación de Meta. Este proceso puede tomar hasta 24
                    horas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
