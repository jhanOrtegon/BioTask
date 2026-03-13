"use client"

import * as React from "react"
import { AlertCircle } from "lucide-react"
import { cn } from "@/shared/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./dropdown-menu"
import { Button } from "./button"

interface ConfirmPopoverProps {
  children: React.ReactNode
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  variant?: "default" | "destructive"
  align?: "start" | "center" | "end"
  side?: "top" | "bottom" | "left" | "right"
}

export function ConfirmPopover({
  children,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  variant = "default",
  align = "center",
  side = "bottom"
}: ConfirmPopoverProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align={align} 
        side={side}
        className="w-80 p-0 border border-border bg-card shadow-2xl rounded-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 duration-200"
      >
        <div className="p-5 space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-bold leading-none text-foreground flex items-center gap-2">
              <AlertCircle className={cn("h-4 w-4", variant === "destructive" ? "text-destructive" : "text-primary")} />
              {title}
            </h4>
            {description && (
              <p className="text-sm text-muted-foreground leading-normal">
                {description}
              </p>
            )}
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs font-medium rounded-lg px-3"
              onClick={(e) => {
                e.preventDefault()
                setOpen(false)
              }}
            >
              {cancelText}
            </Button>
            <Button
              size="sm"
              variant={variant === "destructive" ? "destructive" : "default"}
              className="h-8 text-xs font-medium rounded-lg px-3"
              onClick={(e) => {
                e.preventDefault()
                onConfirm()
                setOpen(false)
              }}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
