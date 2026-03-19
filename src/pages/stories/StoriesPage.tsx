import { useCallback } from 'react'
import { StoriesHeader } from './components/StoriesHeader'
import { StoriesFilter } from './components/StoriesFilter'
import { StoriesTable } from './components/StoriesTable'
import { StoriesDialogs } from './components/StoriesDialogs'
import { useStoriesLogic } from './hooks/useStoriesLogic'
import { Pagination } from '@/shared/components/pagination'
import type { Story } from '@/features/stories/types'

export function StoriesPage() {
 const {
 stories,
 epics,
 search, setSearch,
 epicFilter, setEpicFilter,
 currentPage, setCurrentPage,
 totalPages,
 totalItems,
 itemsPerPage, setItemsPerPage,
 isCreateOpen, setIsCreateOpen,
 showArchived, setShowArchived,
 archiveDialogId, setArchiveDialogId,
 editStoryId, setEditStoryId,
 editCommentDialog, setEditCommentDialog,
 editForm, setEditForm,
 formFields,
 handleDragEnd,
 handleCreateStory,
 handleArchiveStory,
 handleRestoreStory,
 handleSaveEdit,
 navigate
 } = useStoriesLogic()

 const formatDate = (iso: string) => {
 return new Date(iso).toLocaleDateString('es-ES', {
 day: '2-digit', month: 'short', year: 'numeric'
 })
 }

 const handleOpenEdit = useCallback((story: Story) => {
 setEditStoryId(story.id)
 setEditForm({
 code: story.code,
 title: story.title,
 module: story.module,
 description: story.description || '',
 epicId: story.epicId || ''
 })
 }, [setEditStoryId, setEditForm])

 return (
 <div className="min-h-full bg-background p-4 md:p-6 lg:p-8 animate-in fade-in duration-300 relative">
 <div className="max-w-[1600px] mx-auto w-full space-y-8 pb-20">
 <StoriesHeader 
 onNewStory={() => { setIsCreateOpen(true) }} 
 />
 
 <StoriesFilter 
 search={search}
 onSearchChange={(v) => { setSearch(v); setCurrentPage(1); }}
 epicFilter={epicFilter}
 onEpicFilterChange={(v) => { setEpicFilter(v); setCurrentPage(1); }}
 epics={epics}
 showArchived={showArchived}
 onToggleArchived={() => { setShowArchived(!showArchived); setCurrentPage(1); }}
 />

 <div className="flex flex-col flex-1">
 <StoriesTable 
 stories={stories}
 epics={epics}
 onDragEnd={handleDragEnd}
 onView={(id) => { void navigate(`/stories/${id}`) }}
 onEdit={handleOpenEdit}
 onArchive={setArchiveDialogId}
 onRestore={handleRestoreStory}
 isDragDisabled={!!search || epicFilter !== 'all'}
 formatDate={formatDate}
 />

 {totalItems > 0 && (
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
 )}
 </div>
 </div>

 <StoriesDialogs 
 isCreateOpen={isCreateOpen}
 setIsCreateOpen={setIsCreateOpen}
 formFields={formFields}
 epics={epics}
 handleCreate={handleCreateStory}
 editStoryId={editStoryId}
 setEditStoryId={setEditStoryId}
 editForm={editForm}
 setEditForm={setEditForm}
 editCommentDialog={editCommentDialog}
 setEditCommentDialog={setEditCommentDialog}
 handleSaveEdit={handleSaveEdit}
 archiveDialogId={archiveDialogId}
 setArchiveDialogId={setArchiveDialogId}
 handleArchive={handleArchiveStory}
 />
 </div>
 )
}
