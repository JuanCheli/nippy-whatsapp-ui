"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle2, Users, BookOpen, Phone } from "lucide-react"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  formData: {
    courseId: string
    phoneNumber: string
    userIds: string[]
  }
}

export function ConfirmationModal({ isOpen, onClose, onConfirm, formData }: ConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
            <CheckCircle2 className="h-8 w-8 text-secondary-foreground" />
          </div>
          <DialogTitle className="text-center text-xl">{"Confirmar Envío"}</DialogTitle>
          <DialogDescription className="text-center">
            {"¿Estás seguro de que deseas enviar este mensaje de inicio de curso?"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Course ID */}
          <div className="flex items-start gap-3 rounded-lg bg-muted p-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-foreground">{"ID del Curso"}</p>
              <p className="text-sm text-muted-foreground">{formData.courseId}</p>
            </div>
          </div>

          {/* Phone Number */}
          <div className="flex items-start gap-3 rounded-lg bg-muted p-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
              <Phone className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-foreground">{"Número de Teléfono"}</p>
              <p className="text-sm text-muted-foreground">{formData.phoneNumber}</p>
            </div>
          </div>

          {/* User IDs */}
          <div className="flex items-start gap-3 rounded-lg bg-muted p-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-foreground">
                {"Usuarios"} ({formData.userIds.length})
              </p>
              <div className="flex flex-wrap gap-1">
                {formData.userIds.map((userId) => (
                  <span
                    key={userId}
                    className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                  >
                    {userId}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
            {"Cancelar"}
          </Button>
          <Button onClick={onConfirm} className="flex-1">
            {"Confirmar Envío"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
