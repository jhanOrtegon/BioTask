import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEpicsStore } from '@/features/epics/store'
import { useStoriesStore } from '@/features/stories/store'
import { toast } from 'sonner'

export function useEpicsLogic() {
 const { epics, addEpic, updateEpic } = useEpicsStore()
 const { stories } = useStoriesStore()
 const navigate = useNavigate()

 const [isDialogOpen, setIsDialogOpen] = useState(false)
 const [editingEpic, setEditingEpic] = useState<string | null>(null)
 const [search, setSearch] = useState('')
 const [currentPage, setCurrentPage] = useState(1)
 const ITEMS_PER_PAGE = 10;

 const [form, setForm] = useState({
   code: "",
   title: "",
   description: "",
   color: "#3b82f6",
   status: "planning" as "planning" | "active" | "completed",
 });

 const epicStats = useMemo(() => {
   return epics.map((epic) => {
     const epicStories = stories.filter((s) => s.epicId === epic.id);
     const totalTasks = epicStories.reduce((acc, s) => acc + s.tasks.length, 0);
     const completedTasks = epicStories.reduce(
       (acc, s) => acc + s.tasks.filter((t) => t.status === "completed").length,
       0,
     );
     const progress =
       totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
     const totalTimeSpentSeconds = epicStories.reduce(
       (acc, s) =>
         acc + s.tasks.reduce((tAcc, t) => tAcc + (t.timeSpent || 0), 0),
       0,
     );

     const formattedTime =
       totalTimeSpentSeconds > 3600
         ? `${String(Math.floor(totalTimeSpentSeconds / 3600))}h`
         : `${String(Math.floor(totalTimeSpentSeconds / 60))}m`;

     return {
       ...epic,
       storyCount: epicStories.length,
       taskCount: totalTasks,
       completedCount: completedTasks,
       calculatedProgress: progress,
       formattedTime,
       slowestStories: epicStories
         .map((s) => ({
           id: s.id,
           title: s.title,
           pendingCount: s.tasks.filter((t) => t.status !== "completed").length,
         }))
         .sort((a, b) => b.pendingCount - a.pendingCount)
         .slice(0, 2),
     };
   });
 }, [epics, stories]);

 const filteredEpics = useMemo(() => {
   return epicStats.filter(
     (e) =>
       e.title.toLowerCase().includes(search.toLowerCase()) ||
       e.code.toLowerCase().includes(search.toLowerCase()),
   );
 }, [epicStats, search]);

 const paginatedEpics = useMemo(() => {
   return filteredEpics.slice(
     (currentPage - 1) * ITEMS_PER_PAGE,
     currentPage * ITEMS_PER_PAGE,
   );
 }, [filteredEpics, currentPage]);

 const totalPages = Math.ceil(filteredEpics.length / ITEMS_PER_PAGE);

 const smartInsight = useMemo(() => {
   const activeEpics = epicStats.filter((e) => e.status === "active");
   if (activeEpics.length === 0) return null;
   const criticalEpic = [...activeEpics].sort(
     (a, b) => a.calculatedProgress - b.calculatedProgress,
   )[0];
   return {
     id: criticalEpic.id,
     title: "BioTask Analysis",
     message: `"${criticalEpic.title}" requiere atención (${String(criticalEpic.calculatedProgress)}% completado).`,
     bottleneck: criticalEpic.slowestStories[0]?.title,
   };
 }, [epicStats]);

 const openCreate = useCallback(() => {
   setEditingEpic(null);
   setForm({
     code: `EPIC-${String(epics.length + 1).padStart(3, "0")}`,
     title: "",
     description: "",
     color: "#3b82f6",
     status: "planning",
   });
   setIsDialogOpen(true);
 }, [epics.length]);

 const handleSave = useCallback(() => {
   if (!form.title.trim() || !form.code.trim()) {
     toast.error("Campos obligatorios incompletos");
     return;
   }
   if (editingEpic) {
     updateEpic(editingEpic, form);
     toast.success("Épica actualizada");
   } else {
     addEpic(form);
     toast.success("Épica creada");
   }
   setIsDialogOpen(false);
 }, [editingEpic, form, updateEpic, addEpic]);

 return {
   epics: paginatedEpics,
   smartInsight,
   search,
   setSearch,
   currentPage,
   setCurrentPage,
   totalPages,
   isDialogOpen,
   setIsDialogOpen,
   editingEpic,
   setEditingEpic,
   form,
   setForm,
   openCreate,
   handleSave,
   navigate,
 };
}
