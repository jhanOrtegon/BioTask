import { EpicsHeader } from './components/EpicsHeader'
import { EpicCard } from './components/EpicCard'
import { EpicsDialogs } from './components/EpicsDialogs'
import { useEpicsLogic } from './hooks/useEpicsLogic'
import { Pagination } from '@/shared/components/pagination'
import { Input } from '@/shared/components/input'
import { Button } from '@/shared/components/button'
import { Search, Filter, Layers } from 'lucide-react'
import { useCallback } from 'react'
import type { Epic } from '@/features/epics/types'

export function EpicsPage() {
 const {
 epics,
 search, setSearch,
 currentPage, setCurrentPage,
 totalPages,
 isDialogOpen, setIsDialogOpen,
 editingEpic, setEditingEpic,
 form, setForm,
 openCreate,
 handleSave,
 navigate
 } = useEpicsLogic()

 const handleEditEpic = useCallback((epic: Epic) => {
 setEditingEpic(epic.id)
 setForm({
 code: epic.code,
 title: epic.title,
 description: epic.description || '',
 color: epic.color,
 status: epic.status
 })
 setIsDialogOpen(true)
 }, [setEditingEpic, setForm, setIsDialogOpen])

 return (
 <div className="min-h-full flex flex-col bg-background p-4 md:p-6 lg:p-8 relative">
 <div className="max-w-[1600px] mx-auto w-full space-y-8 animate-in fade-in duration-500 pb-20">
 
 <EpicsHeader onNewEpic={openCreate} />
 
 <div className="flex flex-col md:flex-row items-center gap-4">
 <div className="relative group flex-1 w-full">
 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
 <Input 
 placeholder="Buscar épicas por código o nombre..." 
 value={search}
 onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
 className="w-full h-9 bg-background border-border/40 rounded-lg pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary/20 transition-all font-medium"
 />
 </div>
 <div className="flex items-center gap-2 w-full md:w-auto">
 <Button variant="ghost" size="sm" className="rounded-lg text-muted-foreground hover:bg-muted">
 <Filter className="h-4 w-4 opacity-50" /> Todos los Estados
 </Button>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {epics.length === 0 ? (
 <div className="col-span-full py-24 text-center border-2 border-dashed border-border/30 rounded-xl bg-card/30">
 <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-primary/5 mb-6">
 <Layers className="h-8 w-8 text-muted-foreground/40" />
 </div>
 <h3 className="text-lg font-bold tracking-tight">Sin épicas registradas</h3>
 <p className="text-sm text-muted-foreground font-medium mt-1">No se encontraron épicas registradas.</p>
 <Button onClick={openCreate} className="mt-6">Crear Épica</Button>
 </div>
 ) : (
 epics.map((epic) => (
 <EpicCard 
 key={epic.id} 
 epic={epic} 
 onEdit={handleEditEpic}
 onAnalyze={(id) => { void navigate('/stories', { state: { epicId: id } }) }}
 />
 ))
 )}
 </div>

 {totalPages > 1 && (
 <div className="pt-3">
 <Pagination
 currentPage={currentPage}
 totalPages={totalPages} 
 onPageChange={setCurrentPage}
 />
 </div>
 )}

 <EpicsDialogs 
 isDialogOpen={isDialogOpen}
 setIsDialogOpen={setIsDialogOpen}
 editingEpic={editingEpic}
 form={form}
 setForm={setForm}
 onSave={handleSave}
 />
 </div>
 <div className="fixed -bottom-48 -left-48 w-[400px] h-[400px] bg-primary/3 blur-[120px] rounded-full pointer-events-none -z-10" />
 <div className="fixed -top-48 -right-48 w-[400px] h-[400px] bg-primary/3 blur-[120px] rounded-full pointer-events-none -z-10" />
 </div>
 )
}
