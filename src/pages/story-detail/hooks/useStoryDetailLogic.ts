import { useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { useStoriesStore } from '@/features/stories/store'
import { useTasksStore } from '@/features/tasks/store'
import { useSprintsStore } from '@/features/sprints/store'
import { useTeamStore } from '@/features/team/store'
import type { TrackedTask } from '@/features/stories/types'

export function useStoryDetailLogic() {
 const { id } = useParams<{ id: string }>()
 const navigate = useNavigate()
 const {
 stories,
 archiveTask,
 startTaskTimer,
 pauseTaskTimer,
 stopTaskTimer,
 resetTaskTimer,
 updateTask,
 updateStory,
 addTaskToStory
 } = useStoriesStore()
 const { startNewTask } = useTasksStore()
 const { getMemberById } = useTeamStore()
 const { sprints } = useSprintsStore()

 const story = useMemo(() => stories.find(s => s.id === id) || null, [stories, id])
 const sprintForStory = useMemo(() => sprints.find(s => s.storyIds.includes(story?.id || '')), [sprints, story?.id])
 const isReadOnly = useMemo(() => sprintForStory?.status === 'completed', [sprintForStory])

 const [showTimeline, setShowTimeline] = useState(false)
 const [archiveDialog, setArchiveDialog] = useState<{ taskId: string; title: string } | null>(null)
 const [blockDialog, setBlockDialog] = useState<{
   taskId: string;
   title: string;
 } | null>(null);
 const [completeDialog, setCompleteDialog] = useState<{
   taskId: string;
   title: string;
 } | null>(null);
 const [resetTimerDialog, setResetTimerDialog] = useState<{
   taskId: string;
   title: string;
 } | null>(null);
 const [viewTask, setViewTask] = useState<TrackedTask | null>(null);
 const [editStoryDialog, setEditStoryDialog] = useState(false);
 const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
 const [showErrorDialog, setShowErrorDialog] = useState<{
   title: string;
   desc: string;
 } | null>(null);
 const [showExportDialog, setShowExportDialog] = useState(false);
 const [showBulkDialog, setShowBulkDialog] = useState(false);
 const [bulkText, setBulkText] = useState("");
 const [isCopied, setIsCopied] = useState(false);
 const [currentPage, setCurrentPage] = useState(1);
 const ITEMS_PER_PAGE = 10;

 const activeTasks = useMemo(
   () =>
     (story?.tasks.filter((t) => t.status !== "archived") || []).sort(
       (a, b) => (a.position || 0) - (b.position || 0),
     ),
   [story?.tasks],
 );

 const triggerConfetti = useCallback(() => {
   void confetti({
     particleCount: 150,
     spread: 70,
     origin: { y: 0.6 },
     colors: ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6"],
   });
 }, []);

 const handleBulkCreate = useCallback(() => {
   if (!story || !bulkText.trim()) return;
   const lines = bulkText.split("\n").filter((l) => l.trim() !== "");

   lines.forEach((line) => {
     addTaskToStory(story.id, {
       title: line.trim(),
       type: "feature",
       data: { objective: "", services: [], requirements: [], validations: [] },
     });
   });

   toast.success(`${String(lines.length)} tareas creadas`, {
     description: "Ahora puedes editarlas individualmente.",
   });
   setBulkText("");
   setShowBulkDialog(false);
 }, [story, bulkText, addTaskToStory]);

 const handleArchiveTask = useCallback(
   (comment: string) => {
     if (!archiveDialog || !story) return;
     archiveTask(story.id, archiveDialog.taskId, comment);
     toast.warning("Tarea eliminada", {
       description: `${archiveDialog.title} — ${comment}`,
     });
     setArchiveDialog(null);
   },
   [archiveDialog, story, archiveTask],
 );

 const handleBlockTask = useCallback(
   (reason: string) => {
     if (!blockDialog || !story) return;
     // Pause any active timer
     pauseTaskTimer(story.id, blockDialog.taskId);
     updateTask(
       story.id,
       blockDialog.taskId,
       { status: "blocked", isBlocked: true, blockReason: reason },
       `Bloqueada: ${reason}`,
     );
     toast.error("Tarea bloqueada", { description: reason });
     setBlockDialog(null);
   },
   [blockDialog, story, pauseTaskTimer, updateTask],
 );

 const handleCompleteTask = useCallback(
   (comment: string) => {
     if (!completeDialog || !story) return;
     stopTaskTimer(story.id, completeDialog.taskId);
     // stopTaskTimer sets status to completed internally; just add audit trail comment
     updateTask(
       story.id,
       completeDialog.taskId,
       { status: "completed" },
       comment,
     );
     triggerConfetti();
     setCompleteDialog(null);
   },
   [completeDialog, story, stopTaskTimer, updateTask, triggerConfetti],
 );

 const handleResetTimer = useCallback(() => {
   if (!resetTimerDialog || !story) return;
   resetTaskTimer(story.id, resetTimerDialog.taskId);
   toast.info("Tiempo reiniciado", {
     description: `El contador de "${resetTimerDialog.title}" ha vuelto a cero.`,
   });
   setResetTimerDialog(null);
 }, [resetTimerDialog, story, resetTaskTimer]);

 const handleUpdateStory = useCallback(
   (values: {
     code: string;
     title: string;
     module: string;
     description?: string;
   }) => {
     if (!story) return;
     updateStory(
       story.id,
       { ...values, code: values.code.toUpperCase() },
       "Historia actualizada",
     );
     setEditStoryDialog(false);
     setShowUpdateConfirm(false);
     toast.success("Historia actualizada");
   },
   [story, updateStory],
 );

 const handleDragEnd = useCallback(
   (result: {
     source: { index: number };
     destination: { index: number } | null | undefined;
     draggableId: string;
   }) => {
     const { source, destination, draggableId } = result;
     if (!destination || !story) return;
     if (source.index === destination.index) return;

     const otherTasks = activeTasks.filter((t) => t.id !== draggableId);
     let newPosition: number;

     if (otherTasks.length === 0) {
       newPosition = 1000;
     } else if (destination.index === 0) {
       newPosition = (otherTasks[0].position || 0) / 2;
     } else if (destination.index >= otherTasks.length) {
       newPosition = (otherTasks[otherTasks.length - 1].position || 0) + 1000;
     } else {
       const prevPos = otherTasks[destination.index - 1].position || 0;
       const nextPos = otherTasks[destination.index].position || 0;
       newPosition = (prevPos + nextPos) / 2;
     }
     updateTask(
       story.id,
       draggableId,
       { position: newPosition },
       "Tarea reordenada",
     );
   },
   [story, activeTasks, updateTask],
 );

 const findStoryIdForTask = useCallback(
   (taskId: string) => {
     return stories.find((s) => s.tasks.some((t) => t.id === taskId))?.id;
   },
   [stories],
 );

 const totalPages = Math.ceil(activeTasks.length / ITEMS_PER_PAGE);
 const paginatedTasks = useMemo(() => {
   const start = (currentPage - 1) * ITEMS_PER_PAGE;
   return activeTasks.slice(start, start + ITEMS_PER_PAGE);
 }, [activeTasks, currentPage]);

 return {
   story,
   id,
   navigate,
   isReadOnly,
   showTimeline,
   setShowTimeline,
   archiveDialog,
   setArchiveDialog,
   blockDialog,
   setBlockDialog,
   completeDialog,
   setCompleteDialog,
   resetTimerDialog,
   setResetTimerDialog,
   viewTask,
   setViewTask,
   editStoryDialog,
   setEditStoryDialog,
   showUpdateConfirm,
   setShowUpdateConfirm,
   showErrorDialog,
   setShowErrorDialog,
   showExportDialog,
   setShowExportDialog,
   showBulkDialog,
   setShowBulkDialog,
   bulkText,
   setBulkText,
   isCopied,
   setIsCopied,
   currentPage,
   setCurrentPage,
   ITEMS_PER_PAGE,
   activeTasks,
   paginatedTasks,
   totalPages,
   getMemberById,
   startTaskTimer,
   pauseTaskTimer,
   stopTaskTimer,
   updateTask,
   addTaskToStory,
   startNewTask,
   triggerConfetti,
   handleBulkCreate,
   handleArchiveTask,
   handleBlockTask,
   handleCompleteTask,
   handleResetTimer,
   handleUpdateStory,
   handleDragEnd,
   findStoryIdForTask,
 };
}
