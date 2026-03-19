import { DynamicTaskEditor } from "@/features/tasks/components/DynamicTaskEditor"
import { useEditorLogic } from "./hooks/useEditorLogic"
import { EditorToolbar } from "./components/EditorToolbar"
import { PreviewSidePanel } from "./components/PreviewSidePanel"
import { EditorDialogs } from "./components/EditorDialogs"
import { toast } from "sonner"

export function EditorPage() {
 const {
 role,
 currentTask,
 isReadOnly,
 showPreviewPanel, setShowPreviewPanel,
 previewTab, setPreviewTab,
 previewModalOpen, setPreviewModalOpen,
 justificationModalOpen, setJustificationModalOpen,
 showClearConfirm, setShowClearConfirm,
 showFinishConfirm, setShowFinishConfirm,
 importFile, setImportFile,
 fileInputRef,
 handleFinish,
 confirmFinish,
 handleConfirmJustification,
 resetTask,
 updateTaskData,
 updateTaskInfo,
 navigate
 } = useEditorLogic()

 if (!currentTask) return null

 const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0]
 if (!file) return
 setImportFile(file)
 }

 const processImport = () => {
 if (!importFile) return
 const reader = new FileReader()
 reader.onload = (event) => {
 try {
 const json = JSON.parse(event.target?.result as string) as Record<string, unknown>
 if (typeof json.title === 'string') updateTaskInfo({ title: json.title })
 if (typeof json.type === 'string') updateTaskInfo({ type: json.type as import('@/features/templates/types').TaskType })
 if (typeof json.featureName === 'string') updateTaskInfo({ featureName: json.featureName })
 if (typeof json.screenPath === 'string') updateTaskInfo({ screenPath: json.screenPath })
 
 const sectionData = (json.data && typeof json.data === 'object' ? json.data : json) as Record<string, unknown>
 updateTaskData(sectionData as unknown as import('@/features/tasks/types').SectionData)

 toast.success("JSON importado")
 } catch {
 toast.error("Error al importar")
 }
 }
 reader.readAsText(importFile)
 setImportFile(null)
 }

 const handleClearAll = () => {
 setShowClearConfirm(false)
 updateTaskInfo({ title: 'Nueva tarea', featureName: '', screenPath: '' })
 updateTaskData({ objective: '', services: [], requirements: [], validations: [] })
 toast.success('Formulario limpiado')
 }

 return (
 <div className="min-h-full flex flex-col bg-background relative transition-all duration-500">
 <EditorToolbar 
 isReadOnly={isReadOnly}
 role={role || ''}
 showPreviewPanel={showPreviewPanel}
 onTogglePreview={() => { setShowPreviewPanel(!showPreviewPanel); }}
 onExit={() => { resetTask(); void navigate(currentTask.storyId ? `/stories/${currentTask.storyId}` : "/dashboard") }}
 onDownloadExample={() => { /* logic */ }}
 onImportClick={() => fileInputRef.current?.click()}
 onOpenPreviewModal={() => { setPreviewModalOpen(true); }}
 onClearAll={() => { setShowClearConfirm(true); }}
 onFinish={handleFinish}
 isEditing={!!currentTask.id}
 />

 <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImportJson} />

 <div className={`flex-1 min-h-[calc(100vh-80px)] grid ${showPreviewPanel ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} animate-in fade-in duration-700`}>
 <div className="bg-muted/5 min-h-0 overflow-y-auto border-r border-border/5">
 <div className={`p-6 md:p-10 mx-auto w-full transition-all duration-500 ${showPreviewPanel ? 'max-w-5xl' : 'max-w-[1400px]'}`}>
 <DynamicTaskEditor />
 </div>
 </div>

 {showPreviewPanel && (
 <PreviewSidePanel tab={previewTab} setTab={setPreviewTab} />
 )}
 </div>

 <div className="fixed -bottom-48 -left-48 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10 opacity-50" />

 <EditorDialogs 
 previewModalOpen={previewModalOpen}
 setPreviewModalOpen={setPreviewModalOpen}
 justificationModalOpen={justificationModalOpen}
 setJustificationModalOpen={setJustificationModalOpen}
 onConfirmJustification={handleConfirmJustification}
 showClearConfirm={showClearConfirm}
 setShowClearConfirm={setShowClearConfirm}
 onConfirmClear={handleClearAll}
 showFinishConfirm={showFinishConfirm}
 setShowFinishConfirm={setShowFinishConfirm}
 onConfirmFinish={confirmFinish}
 isEditing={!!currentTask.id}
 importFileName={importFile?.name || null}
 onConfirmImport={processImport}
 onCancelImport={() => { setImportFile(null); }}
 />
 </div>
 )
}
