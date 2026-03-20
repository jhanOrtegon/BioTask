import { useTasksLogic } from './hooks/useTasksLogic'
import { TasksHeader } from './components/TasksHeader'
import { TasksTable } from './components/TasksTable'
import { TasksDialogs } from './components/TasksDialogs'
import { Pagination } from '@/shared/components/pagination'
import { CommentDialog } from "@/shared/components/comment-dialog";

export function TasksPage() {
  const {
    tasks,
    activeStories,
    epics,
    members,
    getMemberById,
    selectedEpicIds,
    setSelectedEpicIds,
    selectedStoryIds,
    setSelectedStoryIds,
    selectedStatuses,
    setSelectedStatuses,
    showArchived,
    setShowArchived,
    search,
    setSearch,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    setItemsPerPage,
    archiveDialogData,
    setArchiveDialogData,
    viewTask,
    setViewTask,
    editTask,
    setEditTask,
    isCreatingTask,
    setIsCreatingTask,
    pendingUpdate,
    setPendingUpdate,
    handleStatusChange,
    handlePriorityChange,
    handleConfirmUpdate,
    handleConfirmArchive,
    handleCreateTask,
    navigate,
  } = useTasksLogic();

  return (
    <div className="min-h-full flex flex-col bg-background p-4 md:p-6 lg:p-8 relative transition-all duration-500">
      <div className="max-w-[1600px] mx-auto w-full space-y-8 pb-20">
        <TasksHeader
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setCurrentPage(1);
          }}
          epics={epics}
          selectedEpicIds={selectedEpicIds}
          onEpicChange={(v: string[]) => {
            setSelectedEpicIds(v);
            setCurrentPage(1);
          }}
          selectedStoryIds={selectedStoryIds}
          onStoryChange={(v: string[]) => {
            setSelectedStoryIds(v);
            setCurrentPage(1);
          }}
          selectedStatuses={selectedStatuses}
          onStatusChange={(v: string[]) => {
            setSelectedStatuses(v);
            setCurrentPage(1);
          }}
          activeStories={activeStories}
          showArchived={showArchived}
          onToggleArchived={() => {
            setShowArchived(!showArchived);
            setCurrentPage(1);
          }}
          totalItems={totalItems}
          onCreateTask={() => {
            void navigate("/tasks/new");
          }}
        />

        <div className="flex flex-col flex-1 mt-4">
          <TasksTable
            tasks={tasks}
            getMemberById={getMemberById}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            onView={(task) => {
              void navigate(`/tasks/${task.id}`);
            }}
            onEdit={(task) => {
              void navigate(`/tasks/${task.id}/edit`);
            }}
            onNavigateToStory={(id) => {
              void navigate(`/stories/${id}`);
            }}
          />

          <div className="pt-3">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={(v) => {
                setItemsPerPage(v);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <TasksDialogs
          viewTask={viewTask}
          setViewTask={setViewTask}
          editTask={editTask}
          setEditTask={setEditTask}
          isCreatingTask={isCreatingTask}
          setIsCreatingTask={setIsCreatingTask}
          onUpdateTask={(task) => {
            setPendingUpdate({
              taskId: task.id,
              storyId: task.storyId,
              data: task,
            });
          }}
          onCreateTask={(data) => {
            handleCreateTask(data);
          }}
          pendingUpdate={
            pendingUpdate && pendingUpdate.data.status !== "blocked"
              ? pendingUpdate
              : null
          }
          setPendingUpdate={setPendingUpdate}
          onConfirmUpdate={handleConfirmUpdate}
          archiveDialog={archiveDialogData}
          setArchiveDialog={setArchiveDialogData}
          onConfirmArchive={handleConfirmArchive}
          getMemberById={getMemberById}
          members={members}
          activeStories={activeStories}
        />

        {/* Blocked reason modal — triggered when status changes to 'blocked' */}
        <CommentDialog
          open={!!(pendingUpdate && pendingUpdate.data.status === "blocked")}
          onOpenChange={(open) => {
            if (!open) setPendingUpdate(null);
          }}
          title="¿Por qué está bloqueada?"
          description="Registra el motivo del bloqueo. Quedará registrado en el historial de la tarea."
          variant="warning"
          confirmLabel="Registrar Bloqueo"
          onConfirm={(reason) => {
            if (pendingUpdate) {
              handleConfirmUpdate(reason);
            }
          }}
        />
      </div>

      <div className="fixed -bottom-48 -left-48 w-[400px] h-[400px] bg-primary/3 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="fixed -top-48 -right-48 w-[400px] h-[400px] bg-primary/3 blur-[120px] rounded-full pointer-events-none -z-10" />
    </div>
  );
}
