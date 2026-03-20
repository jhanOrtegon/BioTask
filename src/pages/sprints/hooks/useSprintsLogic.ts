import { useState, useMemo, useCallback } from 'react'
import { useSprintsStore } from '@/features/sprints/store'
import { useStoriesStore } from '@/features/stories/store'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import type { Sprint, SprintStatus } from '@/features/sprints/types'

const sprintSchema = z.object({
 name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
 goal: z.string().optional(),
 startDate: z.string().min(1, 'La fecha de inicio es obligatoria'),
 endDate: z.string().min(1, 'La fecha de fin es obligatoria'),
}).refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
 message: "La fecha de inicio debe ser anterior a la de fin",
 path: ["endDate"],
})

export type SprintFormValues = z.infer<typeof sprintSchema>

export function useSprintsLogic() {
 const { sprints, addSprint, updateSprint, setSprintStories } = useSprintsStore()
 const { stories } = useStoriesStore()

 const [isDialogOpen, setIsDialogOpen] = useState(false)
 const [editingSprint, setEditingSprint] = useState<Sprint | null>(null)
 const [currentPage, setCurrentPage] = useState(1)
 const [itemsPerPage, setItemsPerPage] = useState(6)
 const [selectedStoryIds, setSelectedStoryIds] = useState<string[]>([])

 const [showSaveConfirm, setShowSaveConfirm] = useState(false)
 const [showLaunchConfirm, setShowLaunchConfirm] = useState(false)
 const [pendingLaunchStatus, setPendingLaunchStatus] = useState<{ id: string, status: SprintStatus } | null>(null)
 const [showEditAudit, setShowEditAudit] = useState(false)
 const [showForceCompleteConfirm, setShowForceCompleteConfirm] =
   useState(false);
 const [pendingCompleteId, setPendingCompleteId] = useState<string | null>(
   null,
 );

 const activeStories = useMemo(
   () => stories.filter((s) => s.status !== "archived"),
   [stories],
 );

 const form = useForm<SprintFormValues>({
   resolver: zodResolver(sprintSchema),
   defaultValues: {
     name: "",
     goal: "",
     startDate: "",
     endDate: "",
   },
 });

 const openCreate = useCallback(() => {
   setEditingSprint(null);
   form.reset({
     name: "",
     goal: "",
     startDate: "",
     endDate: "",
   });
   setSelectedStoryIds([]);
   setIsDialogOpen(true);
 }, [form]);

 const openEdit = useCallback(
   (sprint: Sprint) => {
     setEditingSprint(sprint);
     form.reset({
       name: sprint.name,
       goal: sprint.goal || "",
       startDate: new Date(sprint.startDate).toISOString().split("T")[0],
       endDate: new Date(sprint.endDate).toISOString().split("T")[0],
     });
     setSelectedStoryIds(sprint.storyIds);
     setIsDialogOpen(true);
   },
   [form],
 );

 const handleStatusChange = useCallback(
   (id: string, newStatus: SprintStatus) => {
     if (newStatus === "active") {
       const activeSprint = sprints.find(
         (s) => s.status === "active" && s.id !== id,
       );
       if (activeSprint) {
         setPendingLaunchStatus({ id, status: newStatus });
         setShowLaunchConfirm(true);
         return;
       }
     }

     if (newStatus === "completed") {
       const sprint = sprints.find((s) => s.id === id);
       if (sprint) {
         const sprintStories = activeStories.filter((s) =>
           sprint.storyIds.includes(s.id),
         );
         const totalTasks = sprintStories.reduce(
           (acc, curr) =>
             acc + curr.tasks.filter((t) => t.status !== "archived").length,
           0,
         );
         const completedTasks = sprintStories.reduce(
           (acc, curr) =>
             acc + curr.tasks.filter((t) => t.status === "completed").length,
           0,
         );
         const pendingCount = totalTasks - completedTasks;

         if (totalTasks > 0 && completedTasks < totalTasks) {
           // Warn but allow — in real Scrum, sprints close with incomplete items returning to backlog
           setPendingCompleteId(id);
           setShowForceCompleteConfirm(true);
           toast.warning(`Hay ${String(pendingCount)} tareas pendientes`, {
             description:
               "Puedes cerrar el sprint de todas formas. Las tareas incompletas deben moverse al backlog manualmente.",
           });
           return;
         }
       }
     }

     updateSprint(id, { status: newStatus });
     toast.success("Estado actualizado");
   },
   [sprints, activeStories, updateSprint],
 );

 const executeSave = useCallback(
   (comment: string) => {
     const values = form.getValues();
     const sprintData = {
       name: values.name.trim(),
       goal: values.goal?.trim() || undefined,
       startDate: new Date(values.startDate).toISOString(),
       endDate: new Date(values.endDate).toISOString(),
     };

     if (editingSprint) {
       updateSprint(editingSprint.id, sprintData, comment);
       setSprintStories(editingSprint.id, selectedStoryIds);
       toast.success("Sprint actualizado");
     } else {
       const newSprint = addSprint(sprintData);
       setSprintStories(newSprint.id, selectedStoryIds);
       toast.success("Sprint planificado");
     }

     setShowEditAudit(false);
     setIsDialogOpen(false);
   },
   [
     editingSprint,
     form,
     selectedStoryIds,
     updateSprint,
     setSprintStories,
     addSprint,
   ],
 );

 const confirmLaunch = useCallback(() => {
   if (!pendingLaunchStatus) return;
   updateSprint(pendingLaunchStatus.id, { status: pendingLaunchStatus.status });
   setShowLaunchConfirm(false);
   setPendingLaunchStatus(null);
   toast.success("Sprint Activado");
 }, [pendingLaunchStatus, updateSprint]);

 const confirmForceComplete = useCallback(() => {
   if (!pendingCompleteId) return;
   updateSprint(pendingCompleteId, { status: "completed" });
   setShowForceCompleteConfirm(false);
   setPendingCompleteId(null);
   toast.success("Sprint cerrado", {
     description: "Recuerda mover las tareas incompletas al backlog.",
   });
 }, [pendingCompleteId, updateSprint]);

 const paginatedSprints = useMemo(() => {
   const start = (currentPage - 1) * itemsPerPage;
   return [...sprints]
     .sort(
       (a, b) =>
         new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
     )
     .slice(start, start + itemsPerPage);
 }, [sprints, currentPage, itemsPerPage]);

 const totalPages = Math.ceil(sprints.length / itemsPerPage);

 return {
   sprints: paginatedSprints,
   totalSprints: sprints.length,
   activeStories,
   form,
   isDialogOpen,
   setIsDialogOpen,
   editingSprint,
   currentPage,
   setCurrentPage,
   totalPages,
   itemsPerPage,
   setItemsPerPage,
   selectedStoryIds,
   setSelectedStoryIds,
   showSaveConfirm,
   setShowSaveConfirm,
   showLaunchConfirm,
   setShowLaunchConfirm,
   showEditAudit,
   setShowEditAudit,
   showForceCompleteConfirm,
   setShowForceCompleteConfirm,
   openCreate,
   openEdit,
   handleStatusChange,
   executeSave,
   confirmLaunch,
   confirmForceComplete,
 };
}
