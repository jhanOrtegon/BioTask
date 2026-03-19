import { useNavigate } from 'react-router-dom'
import {
 Dialog,
 DialogContent,
} from '@/shared/components/dialog'
import { BioTaskDetail } from '@/features/tasks/components/BioTaskDetail'
import { BioTaskCreate } from '@/features/tasks/components/BioTaskCreate'
import { CommentDialog } from '@/shared/components/comment-dialog'
import type { TrackedTask, Story } from '@/features/stories/types'
import type { TeamMember } from '@/features/team/types'
import type { TaskDraft } from '@/features/tasks/types'

interface TasksDialogsProps {
 viewTask: TrackedTask | null
 setViewTask: (v: TrackedTask | null) => void
 editTask: TrackedTask | null
 setEditTask: (v: TrackedTask | null) => void
 isCreatingTask: boolean
 setIsCreatingTask: (v: boolean) => void
 onUpdateTask: (task: TrackedTask) => void
 onCreateTask: (data: Partial<TaskDraft> & { storyId: string }) => void
 pendingUpdate: { taskId: string; storyId: string; data: Partial<TrackedTask> } | null
 setPendingUpdate: (v: { taskId: string; storyId: string; data: Partial<TrackedTask> } | null) => void
 onConfirmUpdate: (comment: string) => void
 archiveDialog: { taskId: string; title: string; storyId: string } | null
 setArchiveDialog: (v: { taskId: string; title: string; storyId: string } | null) => void
 onConfirmArchive: (comment: string) => void
 getMemberById: (id: string) => TeamMember | undefined
 members: TeamMember[]
 activeStories: Story[]
}

export function TasksDialogs({
 viewTask, setViewTask,
 editTask, setEditTask,
 isCreatingTask, setIsCreatingTask,
 onCreateTask,
 pendingUpdate, setPendingUpdate, onConfirmUpdate,
 archiveDialog, setArchiveDialog, onConfirmArchive,
 getMemberById, members, activeStories
}: TasksDialogsProps) {
 const navigate = useNavigate();

 return (
 <>
 {/* Detail View Dialog */}
 <Dialog open={!!viewTask} onOpenChange={(o) => { if (!o) { setViewTask(null); } }}>
 <DialogContent className="max-w-6xl w-[95vw] h-[85vh] p-0 border-none bg-transparent shadow-none overflow-hidden">
 {viewTask && (
 <BioTaskDetail 
 task={viewTask} 
 getMemberById={getMemberById}
 onFullView={() => {
 void navigate(`/tasks/${viewTask.id}`);
 setViewTask(null);
 }}
 onEdit={() => { 
 void navigate(`/tasks/${viewTask.id}/edit`);
 setViewTask(null);
 }}
 />
 )}
 </DialogContent>
 </Dialog>

 {/* Create Task Dialog */}
 <Dialog open={isCreatingTask} onOpenChange={(o) => { setIsCreatingTask(o); }}>
 <DialogContent className="max-w-4xl w-[90vw] h-[80vh] p-0 border-none bg-transparent shadow-none overflow-hidden">
 <BioTaskCreate 
 stories={activeStories}
 members={members}
 onCreate={(data) => { onCreateTask(data); }}
 onCancel={() => { setIsCreatingTask(false); }}
 />
 </DialogContent>
 </Dialog>

 {/* Edit Task Dialog */}
 <Dialog open={!!editTask} onOpenChange={(o) => { if (!o) { setEditTask(null); } }}>
 <DialogContent className="max-w-4xl w-[90vw] h-[80vh] p-0 border-none bg-transparent shadow-none overflow-hidden">
 {editTask && (
 <div className="bg-background rounded-xl p-12 flex flex-col items-center justify-center text-center space-y-6 border border-primary/20 shadow-2xl">
 <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
 <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
 </div>
 <div>
 <h2 className="text-2xl font-semibold mb-2">Edición Avanzada</h2>
 <p className="text-muted-foreground max-w-sm">Vas a entrar en el modo de refinamiento avanzado para esta tarea.</p>
 </div>
 <div className="flex gap-3">
 <button 
 onClick={() => { setEditTask(null); }}
 className="px-6 py-2 rounded-xl font-bold text-xs border border-border hover:bg-secondary/5 transition-all text-foreground"
 >
 Cancelar
 </button>
 <button 
 onClick={() => { void navigate(`/tasks/${editTask.id}/edit`); setEditTask(null); }}
 className="px-6 py-2 rounded-xl font-bold text-xs bg-primary text-white hover:scale-105 transition-all"
 >
 Iniciar Edición
 </button>
 </div>
 </div>
 )}
 </DialogContent>
 </Dialog>

 <CommentDialog
 open={!!pendingUpdate}
 onOpenChange={(o) => { if (!o) { setPendingUpdate(null); } }}
 title="Justificar Cambio"
 description="Explica por qué estás actualizando esta tarea."
 onConfirm={onConfirmUpdate}
 />

 <CommentDialog
 open={!!archiveDialog}
 onOpenChange={(o) => { if (!o) { setArchiveDialog(null); } }}
 title="Eliminar Tarea"
 description="Explica por qué estás eliminando esta tarea."
 variant="warning"
 confirmLabel="Eliminar"
 onConfirm={onConfirmArchive}
 />
 </>
 )
}
