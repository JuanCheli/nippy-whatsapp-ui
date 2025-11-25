"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Plus, Trash2, AlertCircle, CheckCircle2, Loader2, XCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TemplateService, APIError, type TemplateCategory, type TemplateComponent, type CreateTemplateRequest, type ParameterFormat } from "@/lib/services"
import { useToast } from "@/hooks/use-toast"

interface TemplateVariable {
  id: string
  name: string
  example: string
}

interface TemplateData {
  name: string
  category: TemplateCategory
  language: string
  headerText: string
  bodyText: string
  footerText: string
  variables: TemplateVariable[]
}

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error'

export default function WhatsAppTemplateCreator() {
  const [templateData, setTemplateData] = useState<TemplateData>({
    name: "",
    category: "MARKETING",
    language: "es_MX",
    headerText: "",
    bodyText: "",
    footerText: "",
    variables: [],
  })

  const [variableName, setVariableName] = useState("")
  const [variableExample, setVariableExample] = useState("")
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const { toast } = useToast()

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
  setSubmitStatus('loading')
  setErrorMessage('')

  // Variable para el formato de parámetros (se determina dinámicamente)
  let parameterFormat: ParameterFormat = 'positional'

  try {
    // Validar nombre del template
    if (!TemplateService.validateTemplateName(templateData.name)) {
      throw new Error('El nombre del template debe estar en snake_case (solo letras minúsculas, números y guiones bajos)')
    }

    // Validar código de idioma
    if (!TemplateService.validateLanguageCode(templateData.language)) {
      throw new Error('El código de idioma debe tener formato xx_XX (ej: es_MX, en_US)')
    }

    const components: TemplateComponent[] = []
    console.log('\n🔍 === PROCESAMIENTO DE COMPONENTES ===')

    // ============ HEADER (opcional) ============
    if (templateData.headerText.trim()) {
      console.log('\n📋 Procesando HEADER...')
      const headerText = templateData.headerText.trim()
      console.log('📝 Header text:', headerText)
      
      const headerParams = headerText.match(/\{\{([^}]+)\}\}/g) || []
      console.log('🔍 Parámetros en header:', headerParams)
      
      const headerComponent: TemplateComponent = {
        type: 'HEADER',
        format: 'TEXT',
        text: headerText,
      }
      
      if (headerParams.length > 0) {
        const paramKeys = headerParams.map(p => p.replace(/[{}]/g, ''))
        const headerExamples = paramKeys.map((paramKey, index) => {
          const variable = templateData.variables[index]
          return variable?.example || `ejemplo_${index + 1}`
        })
        
        headerComponent.example = {
          header_text: headerExamples
        }
        console.log('✅ Ejemplos agregados al header:', headerExamples)
      }
      
      components.push(headerComponent)
    }

    // ============ BODY (requerido excepto para AUTHENTICATION) ============
    console.log('\n📋 Procesando BODY...')
    
    // Para templates de AUTHENTICATION, el BODY no se envía (WhatsApp lo genera automáticamente)
    if (templateData.category !== 'AUTHENTICATION') {
      if (!templateData.bodyText.trim()) {
        throw new Error('El cuerpo del mensaje es requerido')
      }

      const bodyText = templateData.bodyText.trim()
      const bodyParams = bodyText.match(/\{\{([^}]+)\}\}/g) || []
      console.log('📝 Body text:', bodyText)
      console.log('🔍 Parámetros detectados:', bodyParams)
      
      // Detectar formato
      const hasPositional = bodyParams.some(p => /^\{\{\d+\}\}$/.test(p))
      if (hasPositional) {
        parameterFormat = 'positional'
        console.log('📌 Formato: POSITIONAL')
      }

      const bodyComponent: TemplateComponent = {
        type: 'BODY',
        text: bodyText,
      }

      if (bodyParams.length > 0) {
        console.log('\n📦 === GENERANDO EJEMPLOS PARA BODY ===')
        const paramKeys = bodyParams.map(p => p.replace(/[{}]/g, ''))
        console.log('🔑 Claves de parámetros:', paramKeys)
        console.log('📊 Formato detectado:', parameterFormat)
        
        if (parameterFormat === 'positional') {
          // FORMATO POSICIONAL según BACKEND (diferente a WhatsApp oficial)
          // Backend espera: body_text_named_params = [{"1": "valor"}]
          console.log('📌 Generando examples para formato POSITIONAL (backend)')
          const examples = paramKeys.map((paramKey, index) => {
            const variable = templateData.variables[index]
            if (!variable) {
              throw new Error(`Falta la variable ${index + 1}`)
            }
            console.log(`   ✅ {"${paramKey}": "${variable.example}"}`)
            return { [paramKey]: variable.example }
          })
          
          bodyComponent.example = {
            body_text_named_params: examples
          }
          console.log('✅ BODY example (positional - formato backend):', examples)
          console.log('   Estructura: example.body_text_named_params = [{"1": "valor"}]')
        } else {
          // FORMATO NOMBRADO
          // Backend espera: body_text_named_params = [{"param_name": "nombre", "example": "valor"}]
          console.log('📌 Generando examples para formato NAMED')
          const examples = paramKeys.map((paramKey, index) => {
            const variable = templateData.variables[index]
            if (!variable) {
              throw new Error(`Falta la variable para {{${paramKey}}}`)
            }
            console.log(`   ✅ { "param_name": "${paramKey}", "example": "${variable.example}" }`)
            return { 
              param_name: paramKey,
              example: variable.example 
            }
          })
          
          bodyComponent.example = {
            body_text_named_params: examples
          }
          console.log('✅ BODY example (named):', examples)
        }
      }

      components.push(bodyComponent)
    } else {
      console.log('⚠️ Template de AUTHENTICATION - BODY se omite (WhatsApp lo genera automáticamente)')
    }

    // ============ FOOTER (opcional) ============
    if (templateData.footerText.trim()) {
      components.push({
        type: 'FOOTER',
        text: templateData.footerText.trim(),
      })
    }

    // Crear request
    const templateRequest: CreateTemplateRequest = {
      name: templateData.name,
      category: templateData.category,
      language: templateData.language,
      components,
      parameter_format: parameterFormat,
    }
    
    console.log('\n📤 ========== REQUEST FINAL ==========')
    console.log('🎯 Parameter Format:', parameterFormat)
    console.log(JSON.stringify(templateRequest, null, 2))
    
    const response = await TemplateService.createTemplate(templateRequest)
    
    setSubmitStatus('success')
    toast({
      title: "✅ Template creado exitosamente",
      description: `El template "${templateData.name}" ha sido enviado a WhatsApp para aprobación.`,
    })

    setTimeout(() => {
      setTemplateData({
        name: "",
        category: "MARKETING",
        language: "es_MX",
        headerText: "",
        bodyText: "",
        footerText: "",
        variables: [],
      })
      setVariableName("")
      setVariableExample("")
      setSubmitStatus('idle')
    }, 3000)

  } catch (error) {
    setSubmitStatus('error')
    const errorMsg = error instanceof APIError 
      ? error.message 
      : error instanceof Error 
      ? error.message 
      : 'Error desconocido'
    
    setErrorMessage(errorMsg)
    toast({
      title: "❌ Error al crear template",
      description: errorMsg,
      variant: "destructive",
    })
  }
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

      {submitStatus === 'success' && (
        <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Template creado exitosamente. Será enviado a WhatsApp para aprobación.
          </AlertDescription>
        </Alert>
      )}

      {submitStatus === 'error' && errorMessage && (
        <Alert className="mb-6 border-destructive bg-destructive/10">
          <XCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            {errorMessage}
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
                  onValueChange={(value) => setTemplateData((prev) => ({ ...prev, category: value as TemplateCategory }))}
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
                    {TemplateService.COMMON_LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Formato: idioma_PAÍS (ej: es_MX)</p>
              </div>

              {/* Información sobre templates de autenticación */}
              {templateData.category === 'AUTHENTICATION' && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Templates de Autenticación:</strong> WhatsApp genera automáticamente el mensaje con el código OTP. 
                    No necesitas agregar cuerpo del mensaje. Solo configura el nombre del template y agrega botones si es necesario.
                  </AlertDescription>
                </Alert>
              )}

              {/* Header Text - No visible para AUTHENTICATION */}
              {templateData.category !== 'AUTHENTICATION' && (
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
              )}

              {/* Body Text - No visible para AUTHENTICATION */}
              {templateData.category !== 'AUTHENTICATION' && (
                <div className="space-y-2">
                  <Label htmlFor="bodyText" className="text-base">
                    Cuerpo del Mensaje
                  </Label>
                  <Textarea
                    id="bodyText"
                    placeholder="Hola {{nombre_alumno}}, tu curso {{nombre_curso}} inicia pronto. ¡Nos vemos!"
                    value={templateData.bodyText}
                    onChange={(e) => setTemplateData((prev) => ({ ...prev, bodyText: e.target.value }))}
                    required
                    rows={5}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use {"{{nombre_variable}}"} para parámetros. Luego defina cada variable abajo con su ejemplo.
                  </p>
                </div>
              )}

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

              {/* Variables - No visible para AUTHENTICATION */}
              {templateData.category !== 'AUTHENTICATION' && (
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
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                size="lg" 
                className="w-full h-12 text-base font-semibold" 
                disabled={submitStatus === 'loading'}
              >
                {submitStatus === 'loading' ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creando Template...
                  </>
                ) : submitStatus === 'success' ? (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Template Creado
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-5 w-5" />
                    Crear Template
                  </>
                )}
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
