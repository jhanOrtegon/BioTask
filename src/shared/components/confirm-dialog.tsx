"use client"

import { cn } from "@/shared/utils"

import {
 AlertDialog,
 AlertDialogAction,
 AlertDialogCancel,
 AlertDialogContent,
 AlertDialogDescription,
 AlertDialogFooter,
 AlertDialogHeader,
 AlertDialogTitle,
} from "./alert-dialog"

interface ConfirmDialogProps {
 open: boolean
 onOpenChange: (open: boolean) => void
 onConfirm: () => void
 onCancel?: () => void
 title: string
 description: string
 confirmText?: string
 cancelText?: string
 variant?: "destructive" | "default"
}

export function ConfirmDialog({
 open,
 onOpenChange,
 onConfirm,
 onCancel,
 title,
 description,
 confirmText = "Confirmar",
 cancelText = "Cancelar",
 variant = "default",
}: ConfirmDialogProps) {
 return (
 <AlertDialog open={open} onOpenChange={onOpenChange}>
 <AlertDialogContent className="max-w-[420px] p-6 gap-6 rounded-xl border border-border/40 shadow-lg bg-card">
 <AlertDialogHeader className="space-y-2 text-center sm:text-left">
 <AlertDialogTitle className="text-xl font-semibold tracking-tight">
 {title}
 </AlertDialogTitle>
 <AlertDialogDescription className="text-sm text-muted-foreground">
 {description}
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter className="flex-col sm:flex-row gap-3 pt-2">
 <AlertDialogCancel
 onClick={(e) => {
 e.stopPropagation()
 onCancel?.()
 }}
 >
 {cancelText}
 </AlertDialogCancel>
 <AlertDialogAction
 onClick={(e) => {
 e.preventDefault()
 e.stopPropagation()
 onConfirm()
 onOpenChange(false)
 }}
 className={cn(
 variant === "destructive" && "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-destructive/10"
 )}
 >
 {confirmText}
 </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 )
}
