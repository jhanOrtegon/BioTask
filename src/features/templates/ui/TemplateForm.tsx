import { useState } from "react"
import type { Template, TaskType } from "../types"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { Checkbox } from "@/shared/ui/checkbox"

interface TemplateFormProps {
  initialData?: Template
  readOnly?: boolean
  onSubmit: (data: Omit<Template, 'id' | 'createdAt'>) => void
  onCancel: () => void
}

export function TemplateForm({ initialData, readOnly = false, onSubmit, onCancel }: TemplateFormProps) {
  const [formData, setFormData] = useState<Omit<Template, 'id' | 'createdAt'>>(() => {
    if (initialData) {
      return {
        title: initialData.title,
        description: initialData.description,
        taskType: initialData.taskType,
        hasObjective: initialData.hasObjective,
        hasServices: initialData.hasServices,
        hasFunctionalRequirements: initialData.hasFunctionalRequirements,
        hasValidations: initialData.hasValidations,
        featureName: initialData.featureName || "",
        screenPath: initialData.screenPath || "",
      }
    }
    return {
      title: "",
      description: "",
      taskType: "feature",
      hasObjective: true,
      hasServices: true,
      hasFunctionalRequirements: true,
      hasValidations: true,
      featureName: "",
      screenPath: "",
    }
  })

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título del Molde</Label>
          <Input 
            id="title" 
            value={formData.title} 
            onChange={e => { setFormData({ ...formData, title: e.target.value }) }} 
            required 
            readOnly={readOnly}
            placeholder="Ej: Feature UI Molde"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="taskType">Tipo de Tarea Principal</Label>
          <Select 
            disabled={readOnly}
            value={formData.taskType} 
            onValueChange={(v: TaskType) => { setFormData({ ...formData, taskType: v }) }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="feature">Feature</SelectItem>
              <SelectItem value="bug">Bug</SelectItem>
              <SelectItem value="refactor">Refactor</SelectItem>
              <SelectItem value="chore">Chore</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción del Molde</Label>
        <Input 
          id="description" 
          value={formData.description} 
          onChange={e => { setFormData({ ...formData, description: e.target.value }) }} 
          readOnly={readOnly}
          placeholder="¿Para qué casos se usa este molde?"
        />
      </div>

      <div className="space-y-4 border-t pt-4">
        <Label className="text-base font-bold">Configuración del Molde (Secciones)</Label>
        <p className="text-sm text-muted-foreground">Activa las secciones que quieres que se rellenen en este molde.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
            <Checkbox 
              id="hasObjective" 
              disabled={readOnly}
              checked={formData.hasObjective} 
              onCheckedChange={(v: boolean) => { setFormData({ ...formData, hasObjective: v }) }} 
            />
            <Label htmlFor="hasObjective" className={readOnly ? "cursor-default" : "cursor-pointer"}>Objetivo de la Tarea</Label>
          </div>
          
          <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
            <Checkbox 
              id="hasServices" 
              disabled={readOnly}
              checked={formData.hasServices} 
              onCheckedChange={(v: boolean) => { setFormData({ ...formData, hasServices: v }) }} 
            />
            <Label htmlFor="hasServices" className={readOnly ? "cursor-default" : "cursor-pointer"}>Sección de Servicios (API/Payload)</Label>
          </div>
          
          <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
            <Checkbox 
              id="hasFunctionalRequirements" 
              disabled={readOnly}
              checked={formData.hasFunctionalRequirements} 
              onCheckedChange={(v: boolean) => { setFormData({ ...formData, hasFunctionalRequirements: v }) }} 
            />
            <Label htmlFor="hasFunctionalRequirements" className={readOnly ? "cursor-default" : "cursor-pointer"}>Requerimientos Funcionales</Label>
          </div>
          
          <div className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
            <Checkbox 
              id="hasValidations" 
              disabled={readOnly}
              checked={formData.hasValidations} 
              onCheckedChange={(v: boolean) => { setFormData({ ...formData, hasValidations: v }) }} 
            />
            <Label htmlFor="hasValidations" className={readOnly ? "cursor-default" : "cursor-pointer"}>Sección de Validaciones</Label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>{readOnly ? 'Cerrar' : 'Cancelar'}</Button>
        {!readOnly && <Button type="submit">Guardar Configuración de Molde</Button>}
      </div>
    </form>
  )
}
