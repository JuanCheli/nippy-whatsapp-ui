"use client"

import { useState } from "react"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, FileText } from "lucide-react"
import WhatsAppTemplateSender from "@/components/whatsapp-template-sender"
import WhatsAppTemplateCreator from "@/components/whatsapp-template-creator"

export default function WhatsAppDashboard() {
  const [activeTab, setActiveTab] = useState("send")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-12">
              <Image src="/logo-nippy.png" alt="Nippy Logo" fill className="object-contain" priority />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Nippy</h1>
              <p className="text-sm text-muted-foreground">Gestión de Mensajes WhatsApp</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Tabs */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2 h-12">
              <TabsTrigger value="send" className="text-base gap-2">
                <MessageSquare className="h-4 w-4" />
                Enviar Templates
              </TabsTrigger>
              <TabsTrigger value="create" className="text-base gap-2">
                <FileText className="h-4 w-4" />
                Crear Templates
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="send" className="mt-0">
            <WhatsAppTemplateSender />
          </TabsContent>

          <TabsContent value="create" className="mt-0">
            <WhatsAppTemplateCreator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
