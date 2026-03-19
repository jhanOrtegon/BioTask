import { Button } from "@/shared/components/button"
import { Badge } from "@/shared/components/badge"
import { Breadcrumbs } from "@/shared/components/breadcrumbs"
import { 
 ArrowLeft, 
 Send, 
 Eye, 
 PanelRightClose, 
 PanelRightOpen, 
 FileJson2, 
 Download, 
 Eraser, 
 Edit
} from "lucide-react"

interface EditorToolbarProps {
 isReadOnly: boolean
 role: string
 showPreviewPanel: boolean
 onTogglePreview: () => void
 onExit: () => void
 onDownloadExample: () => void
 onImportClick: () => void
 onOpenPreviewModal: () => void
 onClearAll: () => void
 onFinish: () => void
 isEditing: boolean
}

export function EditorToolbar({
 isReadOnly,
 role,
 showPreviewPanel,
 onTogglePreview,
 onExit,
 onDownloadExample,
 onImportClick,
 onOpenPreviewModal,
 onClearAll,
 onFinish,
 isEditing
}: EditorToolbarProps) {
 return (
 <header className="flex flex-col gap-4 px-6 md:px-8 py-3 border-b bg-background shrink-0 z-10">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div className="flex items-center gap-4">
 <Button 
 variant="ghost" 
 size="icon" 
 onClick={onExit}
 className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
 >
 <ArrowLeft className="h-4 w-4" />
 </Button>
 
 <div className="space-y-0.5">
 <Breadcrumbs items={[{ label: 'Productividad' }, { label: 'Editor Dinámico' }]} />
 <div className="flex items-center gap-3 pt-0.5">
 <h1 className="text-xl font-bold tracking-tight text-foreground">
 Motor de <span className="text-primary">Definición</span>
 </h1>
 <div className="flex items-center gap-2">
 {isReadOnly && (
 <Badge variant="outline" className="bg-muted border-none text-muted-foreground font-bold px-1.5 py-0 text-xs ">
 Lectura
 </Badge>
 )}
 <Badge variant="outline" className="bg-primary/5 border-primary/10 text-primary font-bold px-1.5 py-0 text-xs ">
 V5 Autocraft
 </Badge>
 </div>
 </div>
 </div>
 </div>
 
 <div className="flex items-center gap-2">
 <div className="flex items-center gap-2 bg-secondary/20 p-1 rounded-xl border border-border/40 mr-2">
 {role !== 'Editor' && (
 <>
 <Button 
 variant="ghost" 
 size="sm" 
 className="h-8 gap-2 text-xs font-bold hover:bg-background rounded-lg shadow-sm" 
 onClick={onDownloadExample}
 >
 <Download className="h-3.5 w-3.5 opacity-60" /> Ejemplo
 </Button>
 <Button 
 variant="ghost" 
 size="sm" 
 className="h-8 gap-2 text-xs font-bold hover:bg-background rounded-lg shadow-sm" 
 onClick={onImportClick}
 >
 <FileJson2 className="h-3.5 w-3.5 opacity-60" /> Importar
 </Button>
 </>
 )}
 
 <Button 
 variant="ghost" 
 size="sm" 
 className="h-8 gap-2 text-xs font-bold hover:bg-background rounded-lg shadow-sm" 
 onClick={onOpenPreviewModal}
 >
 <Eye className="h-3.5 w-3.5 opacity-60" /> Vista Previa
 </Button>
 </div>
 
 <Button 
 variant="outline" 
 size="sm" 
 className="h-9 gap-2 text-xs font-bold rounded-xl border-border/40 hover:bg-primary/5 hover:text-primary transition-all"
 onClick={onTogglePreview}
 >
 {showPreviewPanel ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
 {showPreviewPanel ? 'Fijar Foco' : 'Lateral'}
 </Button>
 
 <div className="w-px h-6 bg-border/40 mx-1" />
 
 <Button
 variant="outline" 
 size="sm" 
 className="h-9 w-9 p-0 text-xs font-bold rounded-xl border-transparent bg-destructive/5 text-destructive hover:bg-destructive/10 transition-all"
 onClick={onClearAll} 
 disabled={isReadOnly}
 >
 <Eraser className="h-4 w-4" />
 </Button>
 
 {role !== 'Editor' && (
 <Button 
 size="sm" 
 className="h-9 px-5 gap-2 font-bold text-xs rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground transition-all active:scale-95" 
 onClick={onFinish} 
 disabled={isReadOnly}
 >
 {isEditing ? <Edit className="h-4 w-4" /> : <Send className="h-4 w-4" />}
 {isEditing ? 'Actualizar' : 'Finalizar'}
 </Button>
 )}
 </div>
 </div>
 </header>
 )
}
