import { useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { TrackedTask } from "@/features/stories/types";
import { useStoryDetailLogic } from "./hooks/useStoryDetailLogic";
import { StoryHeader } from "./components/StoryHeader";
import { TaskTable } from "./components/TaskTable";
import {
  StoryExportDialog,
  StoryBulkDialog,
  StoryEditDialog,
} from "./components/StoryDialogs";
import { TaskViewDialog } from "./components/TaskViewDialog";
import { AuditTimeline } from "@/features/stories/components/AuditTimeline";
import { CommentDialog } from "@/shared/components/comment-dialog";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/dialog";
import { Pagination } from "@/shared/components/pagination";
import { History } from "lucide-react";
import { Button } from "@/shared/components/button";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function StoryDetailPage() {
  const {
    story,
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
    activeTasks,
    paginatedTasks,
    totalPages,
    getMemberById,
    startTaskTimer,
    pauseTaskTimer,
    stopTaskTimer,
    updateTask,
    handleBulkCreate,
    handleArchiveTask,
    handleBlockTask,
    handleCompleteTask,
    handleResetTimer,
    handleUpdateStory,
    handleDragEnd,
    findStoryIdForTask,
  } = useStoryDetailLogic();

  const navigate = useNavigate();

  const generatedMarkdown = useMemo(() => {
    if (!story) return "";
    let md = `# [${story.code}] ${story.title}\n\n`;
    md += `**Módulo:** ${story.module}\n`;
    md += `**Estado:** ${story.status === "active" ? "🟢 Activa" : "⚪ Archivada"}\n`;
    md += `**Actualización:** ${new Date(story.updatedAt).toLocaleDateString()}\n\n`;
    md += `## Descripción\n${story.description || "Sin descripción"}\n\n`;
    md += `--- \n\n`;
    md += `# 📋 Desglose de Tareas Técnicas\n\n`;

    activeTasks.forEach((task) => {
      md += `## [${task.code || "TASK"}] ${task.title}\n`;
      md += `**Tipo:** ${task.type} | **Estado:** ${task.status} | **Estimado:** ${String(task.estimatedHours || 0)}h\n\n`;
      if (task.data.objective)
        md += `### 🎯 Objetivo\n${task.data.objective}\n\n`;
      if (task.data.services.length > 0) {
        md += `### 🔌 Servicios / API\n`;
        task.data.services.forEach((s) => {
          md += `- **${s.name}** (${s.method}): ${s.url}\n`;
        });
        md += `\n`;
      }
      if (task.data.requirements.length > 0) {
        md += `### 📝 Requerimientos\n`;
        task.data.requirements.forEach((r) => {
          md += `- ${r}\n`;
        });
        md += `\n`;
      }
      if (task.data.validations.length > 0) {
        md += `### 🧪 Validaciones\n`;
        task.data.validations.forEach((v) => {
          md += `- [ ] ${v}\n`;
        });
        md += `\n`;
      }
      md += `---\n\n`;
    });
    return md;
  }, [story, activeTasks]);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedMarkdown);
      setIsCopied(true);
      toast.success("Copiado al portapapeles", {
        description: "Ahora puedes pegarlo en Jira o Confluence.",
      });
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch {
      toast.error("Error al copiar");
    }
  }, [generatedMarkdown, setIsCopied]);

  if (!story) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <p className="text-muted-foreground">Historia no encontrada.</p>
        <Button
          onClick={() => {
            void navigate("/stories");
          }}
        >
          Volver a Historias
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col bg-background p-4 md:p-6 lg:p-8 animate-in fade-in duration-300 relative">
      <div className="max-w-[1600px] mx-auto w-full space-y-8 pb-20">
        <StoryHeader
          story={story}
          isReadOnly={isReadOnly}
          activeTasks={activeTasks}
          showTimeline={showTimeline}
          onShowTimeline={setShowTimeline}
          onExport={() => {
            setShowExportDialog(true);
          }}
          onBulkCreate={() => {
            setShowBulkDialog(true);
          }}
          onEditStory={() => {
            setEditStoryDialog(true);
          }}
          onNewTask={() => {
            void navigate("/editor");
          }}
          formatDate={formatDate}
        />

        {showTimeline && (
          <div className="shrink-0 rounded-xl border border-border/40 bg-card/30 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-muted-foreground/60 mb-4 flex items-center gap-2">
              <History className="h-4 w-4" /> Historial de Actividad
            </h3>
            <AuditTimeline entries={story.auditLog} />
          </div>
        )}

        <div className="flex-1 min-h-0">
          <TaskTable
            tasks={paginatedTasks}
            isReadOnly={isReadOnly}
            onDragEnd={handleDragEnd}
            getMemberById={(id: string) => getMemberById(id) || null}
            onStatusChange={(task, newStatus) => {
              if (newStatus === "archived") {
                setArchiveDialog({ taskId: task.id, title: task.title });
              } else if (newStatus === "blocked") {
                setBlockDialog({ taskId: task.id, title: task.title });
              } else if (newStatus === "completed") {
                setCompleteDialog({ taskId: task.id, title: task.title });
              } else if (newStatus === "in_progress") {
                startTaskTimer(story.id, task.id);
              } else {
                updateTask(
                  story.id,
                  task.id,
                  {
                    status: newStatus as TrackedTask["status"],
                  },
                  `Estado cambiado a ${newStatus}`,
                );
              }
            }}
            startTaskTimer={startTaskTimer}
            pauseTaskTimer={pauseTaskTimer}
            stopTaskTimer={stopTaskTimer}
            onViewTask={setViewTask}
            onEditTask={(task) => {
              const sId =
                task.storyId || story.id || findStoryIdForTask(task.id);
              if (sId) {
                void navigate(`/editor/${sId}/${task.id}`);
              } else {
                setShowErrorDialog({
                  title: "Historia no encontrada",
                  desc: "No se puede abrir el editor porque no se encontró la relación con la historia.",
                });
              }
            }}
            onArchiveTask={(t) => {
              setArchiveDialog({ taskId: t.id, title: t.title });
            }}
            onResetTimer={(t) => {
              setResetTimerDialog({ taskId: t.id, title: t.title });
            }}
            formatDate={formatDate}
          />
        </div>

        {totalPages > 1 && (
          <div className="shrink-0 pt-3 flex justify-center border-t border-border/40">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        <StoryExportDialog
          open={showExportDialog}
          onOpenChange={setShowExportDialog}
          markdown={generatedMarkdown}
          isCopied={isCopied}
          onCopy={() => {
            void copyToClipboard();
          }}
        />

        <StoryBulkDialog
          open={showBulkDialog}
          onOpenChange={setShowBulkDialog}
          bulkText={bulkText}
          onBulkTextChange={setBulkText}
          onSubmit={handleBulkCreate}
        />

        <StoryEditDialog
          open={editStoryDialog}
          onOpenChange={setEditStoryDialog}
          defaultValues={{
            code: story.code,
            title: story.title,
            module: story.module,
            description: story.description || "",
          }}
          showConfirm={showUpdateConfirm}
          onShowConfirmChange={setShowUpdateConfirm}
          onConfirm={handleUpdateStory}
        />

        <TaskViewDialog
          task={viewTask}
          onOpenChange={() => {
            setViewTask(null);
          }}
        />

        <CommentDialog
          open={!!archiveDialog}
          onOpenChange={() => {
            setArchiveDialog(null);
          }}
          title="Justificación de eliminación"
          description="Explica por qué estás eliminando esta tarea de la historia."
          variant="warning"
          confirmLabel="Eliminar"
          onConfirm={handleArchiveTask}
        />

        <CommentDialog
          open={!!blockDialog}
          onOpenChange={() => {
            setBlockDialog(null);
          }}
          title="¿Por qué está bloqueada?"
          description={`Indica el motivo del bloqueo para "${blockDialog?.title || ""}". Esto se registrará en la auditóría y notificará al equipo.`}
          variant="warning"
          confirmLabel="Registrar Bloqueo"
          onConfirm={handleBlockTask}
        />

        <CommentDialog
          open={!!completeDialog}
          onOpenChange={() => {
            setCompleteDialog(null);
          }}
          title="Completar tarea"
          description={`Registra un comentario de cierre para "${completeDialog?.title || ""}". Quedas registrado en el historial.`}
          variant="info"
          confirmLabel="Completar"
          onConfirm={handleCompleteTask}
        />

        <ConfirmDialog
          open={!!resetTimerDialog}
          onOpenChange={() => {
            setResetTimerDialog(null);
          }}
          title="¿Reiniciar contador?"
          description="Esta acción borrará todos los registros de tiempo de esta tarea. No se puede deshacer."
          onConfirm={handleResetTimer}
          confirmText="Reiniciar"
        />

        <Dialog
          open={!!showErrorDialog}
          onOpenChange={() => {
            setShowErrorDialog(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-destructive flex items-center gap-2">
                {showErrorDialog?.title}
              </DialogTitle>
              <DialogDescription>{showErrorDialog?.desc}</DialogDescription>
            </DialogHeader>
            <div className="flex justify-end pt-4">
              <Button
                onClick={() => {
                  setShowErrorDialog(null);
                }}
              >
                Entendido
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
