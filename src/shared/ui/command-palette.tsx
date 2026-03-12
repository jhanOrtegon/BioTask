import { useEffect, useState } from "react"
import { Command } from "cmdk"
import { useNavigate } from "react-router-dom"
import { useStoriesStore } from "@/features/stories/store"
import { useTasksStore } from "@/features/tasks/store"
import { Search, MapPin, Hash } from "lucide-react"
import type { TaskDraft } from "@/features/tasks/types"

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { stories } = useStoriesStore()
  const { setCurrentTask } = useTasksStore()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const tasks = stories.flatMap(s => s.tasks.map(t => ({ ...t, storyCode: s.code, storyId: s.id })))
  
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-background/50 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <Command 
        className="w-full max-w-2xl bg-card border border-border shadow-2xl rounded-xl overflow-hidden animate-in fade-in zoom-in-95" 
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        loop
      >
        <div className="flex items-center border-b border-border px-4 py-3 gap-3 text-muted-foreground">
           <Search className="h-5 w-5 shrink-0" />
           <Command.Input 
             placeholder="Buscar historias, tareas, proyectos..." 
             className="w-full bg-transparent text-sm text-foreground font-semibold focus:outline-none placeholder:text-muted-foreground/60" 
             autoFocus
           />
           <div className="flex items-center gap-1 shrink-0 bg-muted px-1.5 py-0.5 rounded text-[10px] font-mono border border-border/50">
              <span className="opacity-50">ESC</span>
           </div>
        </div>
        <Command.List className="p-2 overflow-y-auto max-h-[400px]">
          <Command.Empty className="py-6 text-center text-sm text-muted-foreground font-medium">
             No se encontraron resultados para tu búsqueda.
          </Command.Empty>
          
          <Command.Group heading="Historias Activas" className="px-2 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
             {stories.filter(s => s.status === 'active').map(story => (
               <Command.Item 
                 key={'story-' + story.id} 
                 value={`${story.code} ${story.title} ${story.module}`}
                 onSelect={() => {
                   setOpen(false)
                   void navigate(`/stories/${story.id}`)
                 }}
                 className="flex items-center px-3 py-3 rounded-lg hover:bg-muted text-sm text-foreground cursor-pointer transition-colors aria-selected:bg-primary/10 aria-selected:text-primary data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary group"
               >
                 <MapPin className="mr-3 h-4 w-4 shrink-0 opacity-50 group-data-[selected=true]:opacity-100" />
                 <span className="font-mono text-xs font-black opacity-40 mr-3 shrink-0">{story.code}</span>
                 <span className="font-semibold truncate">{story.title}</span>
                 <span className="ml-auto flex shrink-0 text-[10px] uppercase font-bold text-muted-foreground tracking-wider group-data-[selected=true]:text-primary/70">{story.module}</span>
               </Command.Item>
             ))}
          </Command.Group>
          
          <Command.Group heading="Tareas" className="px-2 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mt-2">
             {tasks.map(task => (
               <Command.Item 
                 key={'task-' + task.id} 
                 value={`${task.storyCode} ${task.code || ''} ${task.title}`}
                 onSelect={() => {
                   setOpen(false)
                   setCurrentTask(task as unknown as TaskDraft)
                   void navigate('/editor')
                 }}
                 className="flex items-center px-3 py-3 rounded-lg hover:bg-muted text-sm text-foreground cursor-pointer transition-colors aria-selected:bg-primary/10 aria-selected:text-primary data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary group"
               >
                 <Hash className="mr-3 h-4 w-4 shrink-0 opacity-50 group-data-[selected=true]:opacity-100" />
                 <span className="font-mono text-xs font-black opacity-40 mr-3 shrink-0">{task.storyCode}</span>
                 {task.code && <span className="font-mono text-[10px] text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded font-black mr-2 shrink-0">{task.code}</span>}
                 <span className="font-semibold truncate">{task.title}</span>
                 {task.status !== 'pending' && (
                    <span className="ml-auto flex shrink-0 text-[9px] uppercase font-bold text-muted-foreground tracking-wider border border-border/50 px-1.5 rounded">{task.status.replace('_', ' ')}</span>
                 )}
               </Command.Item>
             ))}
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  )
}
