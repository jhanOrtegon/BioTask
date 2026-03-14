import { useEffect, useState, useCallback } from "react"
import { Command } from "cmdk"
import { useNavigate } from "react-router-dom"
import { useStoriesStore } from "@/features/stories/store"
import { useTasksStore } from "@/features/tasks/store"
import { 
  MapPin, Hash, LayoutDashboard, Layers, 
  Users, Plus, Sparkles,
  Search as SearchIcon, Command as CommandIcon
} from "lucide-react"
import type { TaskDraft } from "@/features/tasks/types"
import { Badge } from "@/shared/ui/badge"

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
    return () => {
      document.removeEventListener("keydown", down)
    }
  }, [])

  const tasks = stories.flatMap(s => s.tasks.map(t => ({ ...t, storyCode: s.code, storyId: s.id })))

  const runCommand = useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  if (!open) return null

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-background/60 backdrop-blur-md animate-in fade-in duration-300" 
      onClick={() => { setOpen(false) }}
    >
      <Command
        className="w-full max-w-2xl bg-card/80 border border-primary/20 shadow-[0_0_50px_-12px_rgba(var(--primary),0.3)] rounded-3xl overflow-hidden animate-in slide-in-from-top-4 duration-500 backdrop-blur-2xl"
        onClick={(e: React.MouseEvent) => { e.stopPropagation() }}
        loop
      >
        <div className="flex items-center border-b border-primary/10 px-6 py-4 gap-3 bg-primary/5">
           <SearchIcon className="h-5 w-5 shrink-0 text-primary" />
           <Command.Input
             placeholder="Escribe un comando o busca algo..."
             className="w-full bg-transparent text-base text-foreground font-bold focus:outline-none placeholder:text-muted-foreground/40"
             autoFocus
           />
           <Badge variant="outline" className="shrink-0 bg-background/50 border-primary/20 text-[10px] font-black uppercase tracking-widest px-2 py-1 gap-1.5">
              <CommandIcon className="h-3 w-3" /> K
           </Badge>
        </div>

        <Command.List className="p-3 overflow-y-auto max-h-[450px] scrollbar-thin scrollbar-thumb-primary/20">
          <Command.Empty className="py-12 text-center">
             <Sparkles className="h-10 w-10 text-primary/20 mx-auto mb-4" />
             <p className="text-sm text-muted-foreground font-medium">No se encontraron resultados en la red neural BioTask.</p>
          </Command.Empty>

          <Command.Group heading="Navegación Rápida" className="px-3 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">
            <Command.Item
              onSelect={() => { runCommand(() => { void navigate('/') }) }}
              className="flex items-center px-4 py-3 rounded-2xl hover:bg-primary/5 text-sm font-bold text-foreground cursor-pointer transition-all aria-selected:bg-primary aria-selected:text-primary-foreground group mb-1"
            >
              <LayoutDashboard className="mr-3 h-4 w-4 shrink-0 opacity-50 group-aria-selected:opacity-100" />
              Ver Dashboard General
            </Command.Item>
            <Command.Item
              onSelect={() => { runCommand(() => { void navigate('/stories') }) }}
              className="flex items-center px-4 py-3 rounded-2xl hover:bg-primary/5 text-sm font-bold text-foreground cursor-pointer transition-all aria-selected:bg-primary aria-selected:text-primary-foreground group mb-1"
            >
              <LayoutDashboard className="mr-3 h-4 w-4 shrink-0 opacity-50 group-aria-selected:opacity-100" />
              Explorar Todas las Historias
            </Command.Item>
            <Command.Item
              onSelect={() => { runCommand(() => { void navigate('/epics') }) }}
              className="flex items-center px-4 py-3 rounded-2xl hover:bg-primary/5 text-sm font-bold text-foreground cursor-pointer transition-all aria-selected:bg-primary aria-selected:text-primary-foreground group mb-1"
            >
              <Layers className="mr-3 h-4 w-4 shrink-0 opacity-50 group-aria-selected:opacity-100" />
              Hoja de Ruta de Épicas
            </Command.Item>
            <Command.Item
              onSelect={() => { runCommand(() => { void navigate('/team') }) }}
              className="flex items-center px-4 py-3 rounded-2xl hover:bg-primary/5 text-sm font-bold text-foreground cursor-pointer transition-all aria-selected:bg-primary aria-selected:text-primary-foreground group mb-1"
            >
              <Users className="mr-3 h-4 w-4 shrink-0 opacity-50 group-aria-selected:opacity-100" />
              Gestión de Equipo
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Acciones Proactivas" className="px-3 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 mt-4">
            <Command.Item
              onSelect={() => { runCommand(() => { setCurrentTask({} as TaskDraft); void navigate('/editor') }) }}
              className="flex items-center px-4 py-3 rounded-2xl hover:bg-primary/5 text-sm font-bold text-foreground cursor-pointer transition-all aria-selected:bg-primary aria-selected:text-primary-foreground group mb-1"
            >
              <Plus className="mr-3 h-4 w-4 shrink-0 opacity-50 group-aria-selected:opacity-100" />
              Lanzar Nueva Tarea
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Historias Activas" className="px-3 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 mt-4">
             {stories.filter(s => s.status === 'active').slice(0, 5).map(story => (
               <Command.Item
                 key={'story-' + story.id}
                 value={`${story.code} ${story.title} ${story.module}`}
                 onSelect={() => { runCommand(() => { void navigate(`/stories/${story.id}`) }) }}
                 className="flex items-center px-4 py-3 rounded-2xl hover:bg-primary/5 text-sm font-bold text-foreground cursor-pointer transition-all aria-selected:bg-primary aria-selected:text-primary-foreground group mb-1"
               >
                 <MapPin className="mr-3 h-4 w-4 shrink-0 opacity-50 group-aria-selected:opacity-100" />
                 <span className="font-mono text-[10px] font-black opacity-40 mr-3 shrink-0 uppercase tracking-tighter">{story.code}</span>
                 <span className="truncate">{story.title}</span>
                 <div className="ml-auto flex shrink-0 items-center gap-2">
                    <span className="text-[10px] uppercase font-black opacity-40 group-aria-selected:opacity-100">{story.module}</span>
                 </div>
               </Command.Item>
             ))}
          </Command.Group>

          <Command.Group heading="Tareas Recientes" className="px-3 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 mt-4">
             {tasks.slice(0, 8).map(task => (
               <Command.Item
                 key={'task-' + task.id}
                 value={`${task.storyCode} ${task.code || ''} ${task.title}`}
                 onSelect={() => { 
                   runCommand(() => { 
                     setCurrentTask(task as unknown as TaskDraft)
                     void navigate('/editor') 
                   }) 
                 }}
                 className="flex items-center px-4 py-3 rounded-2xl hover:bg-primary/5 text-sm font-bold text-foreground cursor-pointer transition-all aria-selected:bg-primary aria-selected:text-primary-foreground group mb-1"
               >
                 <Hash className="mr-3 h-4 w-4 shrink-0 opacity-50 group-aria-selected:opacity-100" />
                 <span className="font-mono text-[10px] font-black opacity-40 mr-3 shrink-0 uppercase tracking-tighter">{task.storyCode}</span>
                 <span className="truncate">{task.title}</span>
                 {task.status !== 'pending' && (
                    <Badge variant="outline" className="ml-auto text-[9px] uppercase font-black border-none group-aria-selected:bg-background/20">
                      {task.status.replace('_', ' ')}
                    </Badge>
                 )}
               </Command.Item>
             ))}
          </Command.Group>
        </Command.List>

        <div className="bg-primary/5 border-t border-primary/10 px-6 py-3 flex items-center justify-between">
           <p className="text-[10px] text-primary/60 font-black uppercase tracking-widest">BioTask Synapse Engine</p>
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                 <kbd className="bg-background border border-border rounded px-1.5 py-0.5 text-[10px] font-mono">↑↓</kbd>
                 <span className="text-[9px] font-bold uppercase">Navegar</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                 <kbd className="bg-background border border-border rounded px-1.5 py-0.5 text-[10px] font-mono">ENTER</kbd>
                 <span className="text-[9px] font-bold uppercase">Seleccionar</span>
              </div>
           </div>
        </div>
      </Command>
    </div>
  )
}
