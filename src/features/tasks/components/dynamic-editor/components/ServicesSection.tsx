import { Button } from "@/shared/components/button"
import { Input } from "@/shared/components/input"
import { Label } from "@/shared/components/label"
import { Textarea } from "@/shared/components/textarea"
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/shared/components/select"
import { PlusCircle, Trash2, Globe, ChevronRight } from "lucide-react"
import type { ServiceDetail } from "@/features/templates/types"

interface ServicesSectionProps {
 services: ServiceDetail[]
 readOnly: boolean
 onAdd: () => void
 onUpdate: (id: string, updates: Partial<ServiceDetail>) => void
 onRemove: (id: string) => void
 isRequired?: boolean
}

export function ServicesSection({
 services,
 readOnly,
 onAdd,
 onUpdate,
 onRemove,
 isRequired
}: ServicesSectionProps) {
 return (
 <div className="border-x border-border bg-card">
 <div className="px-5 py-3 border-b border-border/50 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="flex items-center gap-1.5">
 <span className="font-mono text-[11px] font-semibold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded">03</span>
 <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
 </div>
 <Globe className="h-4 w-4 text-blue-500" />
 <div className="flex items-center gap-2">
 <h3 className="text-sm font-bold text-foreground">Servicios / API</h3>
 {isRequired && (
 <span className="text-xs font-bold text-amber-600 bg-amber-600/10 px-1.5 py-0.5 rounded border border-amber-600/20 ">Obligatorio</span>
 )}
 </div>
 </div>
 {!readOnly && (
 <Button onClick={onAdd} size="sm" variant="ghost" className="h-7 gap-1.5 text-[11px] font-bold text-blue-500 hover:text-blue-500 hover:bg-blue-500/10">
 <PlusCircle className="h-3 w-3" /> Endpoint
 </Button>
 )}
 </div>
 
 <div className="p-5 pt-4 space-y-3">
 {services.map((service, idx) => (
 <div key={service.id} className="rounded-lg border border-border/60 bg-background overflow-hidden group">
 <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b border-border/70">
 <div className="flex items-center gap-2">
 <span className="font-mono text-[11px] font-semibold text-muted-foreground">#{String(idx + 1)}</span>
 <span className="text-xs font-bold text-foreground">{service.name || 'Nuevo servicio'}</span>
 </div>
 {!readOnly && (
 <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => { onRemove(service.id) }}>
 <Trash2 className="h-3 w-3" />
 </Button>
 )}
 </div>
 
 <div className="p-4 space-y-3">
 <div className="grid grid-cols-12 gap-3">
 <div className="col-span-4 space-y-1">
 <Label className="text-xs uppercase font-semibold tracking-wide text-muted-foreground">Nombre</Label>
 <Input disabled={readOnly} placeholder="API Name" value={service.name} onChange={e => { onUpdate(service.id, { name: e.target.value }) }} className="h-9 text-xs bg-muted/20" />
 </div>
 <div className="col-span-2 space-y-1">
 <Label className="text-xs uppercase font-semibold tracking-wide text-muted-foreground">Método</Label>
 <Select disabled={readOnly} value={service.method} onValueChange={(v: ServiceDetail['method']) => { onUpdate(service.id, { method: v }) }}>
 <SelectTrigger className="h-9 text-xs font-mono font-bold bg-muted/20"><SelectValue /></SelectTrigger>
 <SelectContent>
 <SelectItem value="GET">GET</SelectItem>
 <SelectItem value="POST">POST</SelectItem>
 <SelectItem value="PUT">PUT</SelectItem>
 <SelectItem value="DELETE">DELETE</SelectItem>
 <SelectItem value="PATCH">PATCH</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div className="col-span-6 space-y-1">
 <Label className="text-xs uppercase font-semibold tracking-wide text-muted-foreground">Endpoint</Label>
 <Input disabled={readOnly} placeholder="/api/v1/resource" value={service.url} onChange={e => { onUpdate(service.id, { url: e.target.value }) }} className="h-9 text-xs font-mono bg-muted/20" />
 </div>
 </div>

 <div className="space-y-1">
 <Label className="text-xs uppercase font-semibold tracking-wide text-muted-foreground">Query Params</Label>
 <Input disabled={readOnly} placeholder="?key=value" value={service.params} onChange={e => { onUpdate(service.id, { params: e.target.value }) }} className="h-9 text-xs font-mono bg-muted/20" />
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div className="space-y-1">
 <Label className="text-xs uppercase font-semibold tracking-wide text-blue-400">Payload</Label>
 <Textarea disabled={readOnly} placeholder='{ }' className="font-mono text-[11px] min-h-[120px] bg-[hsl(225,25%,8%)] text-emerald-400/90 border-border/30 resize-none" value={service.payload} onChange={e => { onUpdate(service.id, { payload: e.target.value }) }} />
 </div>
 <div className="space-y-1">
 <Label className="text-xs uppercase font-semibold tracking-wide text-emerald-400">Response</Label>
 <Textarea disabled={readOnly} placeholder='{ }' className="font-mono text-[11px] min-h-[120px] bg-[hsl(225,25%,8%)] text-sky-400/90 border-border/30 resize-none" value={service.response} onChange={e => { onUpdate(service.id, { response: e.target.value }) }} />
 </div>
 </div>
 </div>
 </div>
 ))}
 {services.length === 0 && !readOnly && (
 <button onClick={onAdd} className="w-full border-2 border-dashed border-border/40 rounded-lg p-8 text-center text-muted-foreground/60 text-xs font-medium hover:border-blue-500/30 hover:text-blue-500/60 transition-colors cursor-pointer">
 Click para agregar tu primer endpoint
 </button>
 )}
 {services.length === 0 && readOnly && (
 <div className="text-center py-6 bg-muted/5 rounded-lg border border-border/20">
 <span className="text-xs text-muted-foreground italic">No hay servicios asociados.</span>
 </div>
 )}
 </div>
 </div>
 )
}
