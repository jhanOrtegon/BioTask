import { 
 Dialog, 
 DialogContent, 
 DialogHeader, 
 DialogTitle, 
 DialogDescription 
} from '@/shared/components/dialog'
import { Badge } from '@/shared/components/badge'
import { DynamicTaskEditor } from '@/features/tasks/components/DynamicTaskEditor'
import type { TrackedTask } from '@/features/stories/types'
import type { TaskDraft } from '@/features/tasks/types'

interface TaskViewDialogProps {
 task: TrackedTask | null
 onOpenChange: (open: boolean) => void
}

export function TaskViewDialog({ task, onOpenChange }: TaskViewDialogProps) {
 return (
 <Dialog open={!!task} onOpenChange={onOpenChange}>
 <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl p-0 border-none shadow-2xl">
 <DialogHeader className="p-8 bg-gradient-to-br from-primary/10 via-background to-background border-b border-border/50">
 <div className="flex items-center gap-3 mb-2">
 <Badge className="bg-primary/20 text-primary border-none text-xs font-medium">{task?.code}</Badge>
 <Badge variant="outline" className="text-xs font-bold">{task?.type}</Badge>
 </div>
 <DialogTitle className="text-3xl font-semibold tracking-tight">{task?.title}</DialogTitle>
 <DialogDescription className="font-bold text-muted-foreground text-xs">Vista de Ejecución Técnica</DialogDescription>
 </DialogHeader>
 <div className="p-8 bg-card">
 {task && <DynamicTaskEditor task={task as unknown as TaskDraft} readOnly={true} />}
 </div>
 </DialogContent>
 </Dialog>
 )
}
