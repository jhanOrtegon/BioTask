import { useTemplatesStore } from "../store"
import { TemplateCard } from "./TemplateCard"
import { useTasksStore } from "@/features/tasks/store"
import { useNavigate } from "react-router-dom"
import type { Template } from "../types"

export function TemplateGrid() {
  const { templates } = useTemplatesStore()
  const { startNewTask } = useTasksStore()
  const navigate = useNavigate()

  const handleSelectTemplate = (template: Template) => {
    // Inicializamos la tarea con el molde seleccionado
    startNewTask(template)
    void navigate("/editor")
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <TemplateCard 
          key={template.id} 
          template={template} 
          onSelect={() => { handleSelectTemplate(template) }} 
        />
      ))}
    </div>
  )
}
