import { Button } from "@/shared/components/button"
import { Input } from "@/shared/components/input"
import { ChevronRight, Hash, Plus, PlusCircle, Trash2, CheckCircle2, CheckSquare } from "lucide-react"

interface SectionHeaderProps {
 number: string
 icon: React.ElementType
 title: string
 color: string
 action?: React.ReactNode
 isRequired?: boolean
}

export const SectionHeader = ({ number, icon: Icon, title, color, action, isRequired }: SectionHeaderProps) => (
 <div className="flex items-center justify-between py-3 border-b border-border/50">
 <div className="flex items-center gap-3">
 <div className="flex items-center gap-1.5">
 <span className={`font-mono text-[11px] font-semibold ${color} bg-current/10 px-1.5 py-0.5 rounded`} style={{ backgroundColor: 'var(--muted)' }}>
 {number}
 </span>
 <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
 </div>
 <Icon className={`h-4 w-4 ${color}`} />
 <div className="flex items-center gap-2">
 <h3 className="text-sm font-bold text-foreground">{title}</h3>
 {isRequired && (
 <span className="text-xs font-bold text-amber-600 bg-amber-600/10 px-1.5 py-0.5 rounded border border-amber-600/20 ">
 Obligatorio
 </span>
 )}
 </div>
 </div>
 {action}
 </div>
)

interface ListSectionProps {
 number: string
 title: string
 color: string
 items: string[]
 readOnly: boolean
 onAdd: () => void
 onUpdate: (index: number, value: string) => void
 onRemove: (index: number) => void
 isRequired?: boolean
}

export function ListSection({ number, title, color, items, readOnly, onAdd, onUpdate, onRemove, isRequired }: ListSectionProps) {
 return (
 <div>
 <div className="px-5">
 <SectionHeader 
 number={number} 
 icon={Hash} 
 title={title} 
 color={color}
 isRequired={isRequired}
 action={!readOnly && (
 <Button onClick={onAdd} size="sm" variant="ghost" className={`h-7 px-2 ${color} hover:bg-current/10`}>
 <Plus className="h-3 w-3" />
 </Button>
 )}
 />
 </div>
 <div className="p-5 pt-3 space-y-1.5">
 {items.map((item, i) => (
 <div key={i} className="flex items-center gap-2 group">
 <span className="text-[11px] font-mono font-bold text-muted-foreground/40 w-5 text-right shrink-0">{String(i + 1)}</span>
 <Input 
 disabled={readOnly}
 value={item}
 onChange={e => { onUpdate(i, e.target.value) }}
 placeholder={`${title} ${String(i + 1)}`}
 className="h-9 text-xs bg-transparent border-transparent hover:border-border focus:border-border transition-colors"
 />
 {!readOnly && (
 <Button 
 variant="ghost" size="icon"
 className="shrink-0 h-7 w-7 text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100" 
 onClick={() => { onRemove(i) }}
 >
 <Trash2 className="h-3 w-3" />
 </Button>
 )}
 </div>
 ))}
 {!readOnly && (
 <button
 onClick={onAdd}
 className={`w-full text-left pl-7 py-2 text-[11px] text-muted-foreground/40 hover:${color}/60 transition-colors cursor-pointer`}
 >
 + Añadir ítem...
 </button>
 )}
 {items.length === 0 && readOnly && (
 <span className="text-[11px] text-muted-foreground italic pl-7">Sin registros.</span>
 )}
 </div>
 </div>
 )
}

interface ChecklistSectionProps {
 items: Array<{ id: string; title: string, completed: boolean }>
 readOnly: boolean
 onAdd: () => void
 onUpdate: (id: string, updates: { completed?: boolean; title?: string }) => void
 onRemove: (id: string) => void
}

export function ChecklistSection({ items, readOnly, onAdd, onUpdate, onRemove }: ChecklistSectionProps) {
 return (
 <div className="border-x border-[0px] border-b border-border bg-card">
 <div className="px-5 border-t border-border">
 <SectionHeader 
 number="02" icon={CheckSquare} title="Checklist" color="text-violet-500"
 action={!readOnly && (
 <Button onClick={onAdd} size="sm" variant="ghost" className="h-7 gap-1.5 text-[11px] font-bold text-violet-500 hover:text-violet-500 hover:bg-violet-500/10">
 <PlusCircle className="h-3 w-3" /> Añadir Ítem
 </Button>
 )}
 />
 </div>
 <div className="p-5 pt-4 space-y-2">
 {items.map((item, idx) => (
 <div key={item.id} className="flex items-center gap-3 bg-muted/20 border border-border/50 p-2 rounded-lg group">
 <button 
 disabled={readOnly}
 onClick={() => { onUpdate(item.id, { completed: !item.completed }) }}
 className={`shrink-0 flex items-center justify-center w-5 h-5 rounded border transition-colors ${item.completed ? 'bg-violet-500 border-violet-500 text-white' : 'border-border/80 bg-background'}`}
 >
 {item.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
 </button>
 <Input
 disabled={readOnly}
 value={item.title}
 onChange={e => { onUpdate(item.id, { title: e.target.value }) }}
 placeholder={`Subtarea ${String(idx + 1)}`}
 className={`h-8 text-xs bg-transparent border-transparent hover:border-border transition-colors ${item.completed ? 'line-through text-muted-foreground' : ''}`}
 />
 {!readOnly && (
 <Button 
 variant="ghost" size="icon"
 className="shrink-0 h-7 w-7 text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100" 
 onClick={() => { onRemove(item.id) }}
 >
 <Trash2 className="h-3 w-3" />
 </Button>
 )}
 </div>
 ))}
 {items.length === 0 && !readOnly && (
 <div className="text-center py-4 bg-muted/10 rounded-lg border border-dashed border-border/40 cursor-pointer hover:bg-muted/20 transition-colors" onClick={onAdd}>
 <span className="text-xs text-muted-foreground">Click aquí para agregar subtareas...</span>
 </div>
 )}
 {items.length === 0 && readOnly && (
 <div className="text-center py-4 bg-muted/5 rounded-lg border border-border/20">
 <span className="text-xs text-muted-foreground italic">Sin subtareas.</span>
 </div>
 )}
 </div>
 </div>
 )
}
