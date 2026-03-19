import { useState } from "react"
import type { Template, TaskType } from "../types"
import { Button } from "@/shared/components/button"
import { Input } from "@/shared/components/input"
import { Label } from "@/shared/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/select"
import { Checkbox } from "@/shared/components/checkbox"
import { Info, ShieldCheck, LayoutPanelLeft, Code2, ListTodo, Microscope } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/tooltip"

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
        requiredObjective: initialData.requiredObjective || false,
        requiredServices: initialData.requiredServices || false,
        requiredRequirements: initialData.requiredRequirements || false,
        requiredValidations: initialData.requiredValidations || false,
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
      requiredObjective: false,
      requiredServices: false,
      requiredRequirements: false,
      requiredValidations: false,
      featureName: "",
      screenPath: "",
    }
  })

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-h-[75vh] overflow-y-auto px-1">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
              <LayoutPanelLeft className="h-3.5 w-3.5" /> Título del Molde
            </Label>
            <Input 
              id="title" 
              value={formData.title} 
              onChange={e => { setFormData({ ...formData, title: e.target.value }) }} 
              required 
              readOnly={readOnly}
              placeholder="Ej: Feature UI Molde"
              className="rounded-xl border-muted-foreground/20 focus:border-primary transition-all"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taskType" className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
              <Info className="h-3.5 w-3.5" /> Tipo de Tarea
            </Label>
            <Select 
              disabled={readOnly}
              value={formData.taskType} 
              onValueChange={(v: TaskType) => { setFormData({ ...formData, taskType: v }) }}
            >
              <SelectTrigger className="rounded-xl border-muted-foreground/20">
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
          <Label htmlFor="description" className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
            <Info className="h-3.5 w-3.5" /> Descripción
          </Label>
          <Input 
            id="description" 
            value={formData.description} 
            onChange={e => { setFormData({ ...formData, description: e.target.value }) }} 
            readOnly={readOnly}
            placeholder="¿Para qué casos se usa este molde?"
            className="rounded-xl border-muted-foreground/20 focus:border-primary transition-all"
          />
        </div>

        <div className="space-y-4 border-t pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-semibold tracking-tight flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" /> Estructura y Reglas Pro
              </Label>
              <p className="text-xs text-muted-foreground">Configura qué secciones son visibles y cuáles son obligatorias para el equipo.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {/* Section Card: Objective */}
            <div className={`p-4 rounded-xl border transition-all ${formData.hasObjective ? 'bg-primary/5 border-primary/20 shadow-sm' : 'bg-muted/10 border-border opacity-60'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-background border flex items-center justify-center">
                    <LayoutPanelLeft className={`h-4 w-4 ${formData.hasObjective ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <Label htmlFor="hasObjective" className="font-bold cursor-pointer">Objetivo de la Tarea</Label>
                    <p className="text-[11px] text-muted-foreground">Describe el "para qué" de este ticket.</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-muted-foreground">Visible</span>
                    <Checkbox 
                      id="hasObjective" 
                      disabled={readOnly}
                      checked={formData.hasObjective} 
                      onCheckedChange={(v: boolean) => { setFormData({ ...formData, hasObjective: v, requiredObjective: v ? formData.requiredObjective : false }) }} 
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className={`text-xs font-semibold ${formData.requiredObjective ? 'text-amber-600' : 'text-muted-foreground'}`}>Obligatorio</span>
                        </TooltipTrigger>
                        <TooltipContent>No se podrá guardar la tarea sin este campo</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Checkbox 
                      id="requiredObjective" 
                      disabled={readOnly || !formData.hasObjective}
                      checked={formData.requiredObjective} 
                      onCheckedChange={(v: boolean) => { setFormData({ ...formData, requiredObjective: v }) }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section Card: Services */}
            <div className={`p-4 rounded-xl border transition-all ${formData.hasServices ? 'bg-blue-500/5 border-blue-500/20 shadow-sm' : 'bg-muted/10 border-border opacity-60'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-background border flex items-center justify-center">
                    <Code2 className={`h-4 w-4 ${formData.hasServices ? 'text-blue-500' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <Label htmlFor="hasServices" className="font-bold cursor-pointer">Servicios / API</Label>
                    <p className="text-[11px] text-muted-foreground">Endpoints, payloads y respuestas.</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-muted-foreground">Visible</span>
                    <Checkbox 
                      id="hasServices" 
                      disabled={readOnly}
                      checked={formData.hasServices} 
                      onCheckedChange={(v: boolean) => { setFormData({ ...formData, hasServices: v, requiredServices: v ? formData.requiredServices : false }) }} 
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-semibold ${formData.requiredServices ? 'text-amber-600' : 'text-muted-foreground'}`}>Obligatorio</span>
                    <Checkbox 
                      id="requiredServices" 
                      disabled={readOnly || !formData.hasServices}
                      checked={formData.requiredServices} 
                      onCheckedChange={(v: boolean) => { setFormData({ ...formData, requiredServices: v }) }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section Card: Requirements */}
            <div className={`p-4 rounded-xl border transition-all ${formData.hasFunctionalRequirements ? 'bg-emerald-500/5 border-emerald-500/20 shadow-sm' : 'bg-muted/10 border-border opacity-60'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-background border flex items-center justify-center">
                    <ListTodo className={`h-4 w-4 ${formData.hasFunctionalRequirements ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <Label htmlFor="hasFunctionalRequirements" className="font-bold cursor-pointer">Requerimientos</Label>
                    <p className="text-[11px] text-muted-foreground">Lista de funcionalidades específicas.</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-muted-foreground">Visible</span>
                    <Checkbox 
                      id="hasFunctionalRequirements" 
                      disabled={readOnly}
                      checked={formData.hasFunctionalRequirements} 
                      onCheckedChange={(v: boolean) => { setFormData({ ...formData, hasFunctionalRequirements: v, requiredRequirements: v ? formData.requiredRequirements : false }) }} 
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-semibold ${formData.requiredRequirements ? 'text-amber-600' : 'text-muted-foreground'}`}>Obligatorio</span>
                    <Checkbox 
                      id="requiredRequirements" 
                      disabled={readOnly || !formData.hasFunctionalRequirements}
                      checked={formData.requiredRequirements} 
                      onCheckedChange={(v: boolean) => { setFormData({ ...formData, requiredRequirements: v }) }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section Card: Validations */}
            <div className={`p-4 rounded-xl border transition-all ${formData.hasValidations ? 'bg-purple-500/5 border-purple-500/20 shadow-sm' : 'bg-muted/10 border-border opacity-60'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-background border flex items-center justify-center">
                    <Microscope className={`h-4 w-4 ${formData.hasValidations ? 'text-purple-500' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <Label htmlFor="hasValidations" className="font-bold cursor-pointer">Validaciones</Label>
                    <p className="text-[11px] text-muted-foreground">Checklist de criterios de aceptación.</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-muted-foreground">Visible</span>
                    <Checkbox 
                      id="hasValidations" 
                      disabled={readOnly}
                      checked={formData.hasValidations} 
                      onCheckedChange={(v: boolean) => { setFormData({ ...formData, hasValidations: v, requiredValidations: v ? formData.requiredValidations : false }) }} 
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-semibold ${formData.requiredValidations ? 'text-amber-600' : 'text-muted-foreground'}`}>Obligatorio</span>
                    <Checkbox 
                      id="requiredValidations" 
                      disabled={readOnly || !formData.hasValidations}
                      checked={formData.requiredValidations} 
                      onCheckedChange={(v: boolean) => { setFormData({ ...formData, requiredValidations: v }) }} 
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button type="button" variant="outline" className="rounded-xl px-6" onClick={onCancel}>{readOnly ? 'Cerrar' : 'Cancelar'}</Button>
        {!readOnly && <Button type="submit" className="rounded-xl px-8 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95">Guardar Configuración de Molde</Button>}
      </div>
    </form>
  )
}
