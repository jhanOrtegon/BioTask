import { SprintsHeader } from './components/SprintsHeader'
import { SprintCard } from './components/SprintCard'
import { SprintsDialogs } from './components/SprintsDialogs'
import { useSprintsLogic } from './hooks/useSprintsLogic'
import { Pagination } from '@/shared/components/pagination'
import { CalendarDays, Plus } from 'lucide-react'
import { Button } from '@/shared/components/button'

export function SprintsPage() {
 const {
 sprints,
 totalSprints,
 activeStories,
 form,
 isDialogOpen, setIsDialogOpen,
 editingSprint,
 currentPage, setCurrentPage,
 totalPages,
 itemsPerPage, setItemsPerPage,
 selectedStoryIds, setSelectedStoryIds,
 showSaveConfirm, setShowSaveConfirm,
 showLaunchConfirm, setShowLaunchConfirm,
 showEditAudit, setShowEditAudit,
 openCreate,
 openEdit,
 handleStatusChange,
 executeSave,
 confirmLaunch
 } = useSprintsLogic()

 const formatDate = (iso: string) => {
 return new Date(iso).toLocaleDateString('es-ES', {
 day: '2-digit', month: 'short', year: 'numeric'
 })
 }

 const toggleStorySelection = (id: string) => {
 setSelectedStoryIds(prev =>
 prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
 )
 }

 const handleSave = async () => {
 const isValid = await form.trigger()
 if (isValid) {
 setShowSaveConfirm(true)
 }
 }

 const confirmSave = () => {
 setShowSaveConfirm(false)
 if (editingSprint) {
 setShowEditAudit(true)
 } else {
 executeSave('Creado inicialmente')
 }
 }

 return (
 <div className="min-h-full flex flex-col bg-background p-4 md:p-6 lg:p-8 animate-in fade-in duration-300 relative">
 <div className="max-w-[1600px] mx-auto w-full space-y-8 animate-in fade-in duration-500 pb-20">
 <SprintsHeader 
 totalCycles={totalSprints}
 activeCycles={sprints.filter(s => s.status === 'active').length}
 onNewSprint={openCreate}
 />
 
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
 {sprints.length === 0 ? (
 <div className="col-span-full flex flex-col items-center justify-center py-24 bg-card/10 rounded-xl border-2 border-dashed border-border/40">
 <div className="h-16 w-16 rounded-xl bg-muted/30 flex items-center justify-center mb-4">
 <CalendarDays className="h-10 w-10 text-muted-foreground/30" />
 </div>
 <h3 className="text-xl font-bold text-foreground">No hay sprints planificados</h3>
 <p className="text-sm text-muted-foreground mt-1">Haga clic en 'Lanzar Planificación' para comenzar un nuevo ciclo.</p>
 <Button variant="outline" className="mt-6" onClick={openCreate}>
 <Plus className="h-4 w-4 mr-2" /> Planificar Ahora
 </Button>
 </div>
 ) : (
 sprints.map(sprint => (
 <SprintCard 
 key={sprint.id}
 sprint={sprint}
 activeStories={activeStories}
 onEdit={openEdit}
 onStatusChange={handleStatusChange}
 formatDate={formatDate}
 />
 ))
 )}
 </div>

 {totalSprints > 0 && (
 <div className="pt-4 pb-12">
 <Pagination
 currentPage={currentPage}
 totalPages={totalPages}
 onPageChange={setCurrentPage}
 totalItems={totalSprints}
 itemsPerPage={itemsPerPage}
 onItemsPerPageChange={(v) => {
 setItemsPerPage(v);
 setCurrentPage(1);
 }}
 itemsPerPageOptions={[6, 12, 24]}
 />
 </div>
 )}

 <SprintsDialogs 
 isDialogOpen={isDialogOpen}
 setIsDialogOpen={setIsDialogOpen}
 editingSprint={editingSprint}
 form={form}
 activeStories={activeStories}
 selectedStoryIds={selectedStoryIds}
 onToggleStory={toggleStorySelection}
 onSave={handleSave}
 showSaveConfirm={showSaveConfirm}
 setShowSaveConfirm={setShowSaveConfirm}
 onConfirmSave={confirmSave}
 showLaunchConfirm={showLaunchConfirm}
 setShowLaunchConfirm={setShowLaunchConfirm}
 onConfirmLaunch={confirmLaunch}
 showEditAudit={showEditAudit}
 setShowEditAudit={setShowEditAudit}
 onConfirmAudit={executeSave}
 />
 </div>
 </div>
 )
}
