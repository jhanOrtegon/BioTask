import { Button } from "@/shared/components/button"
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogHeader,
 DialogTitle,
} from "@/shared/components/dialog"
import { GitMerge, ClipboardCopy, CheckCircle2 } from "lucide-react"

interface CommitDialogProps {
 open: boolean
 onOpenChange: (open: boolean) => void
 commit: string
 lang: 'es' | 'en'
 onLangChange: (lang: 'es' | 'en') => void
 copied: boolean
 onCopy: () => void
}

export function CommitDialog({
 open,
 onOpenChange,
 commit,
 lang,
 onLangChange,
 copied,
 onCopy
}: CommitDialogProps) {
 return (
 <Dialog open={open} onOpenChange={onOpenChange}>
 <DialogContent className="max-w-xl rounded-xl p-0 overflow-hidden border-none shadow-2xl">
 <DialogHeader className="p-8 bg-gradient-to-br from-blue-500/10 via-background to-background border-b border-border/50">
 <div className="flex items-center justify-between mb-4">
 <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500">
 <GitMerge className="h-3.5 w-3.5" />
 <span className="text-[11px] font-medium">Conventional Commit</span>
 </div>
 <div className="flex bg-muted rounded-lg p-1">
 <button onClick={() => { onLangChange('en') }} className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${lang === 'en' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}>EN</button>
 <button onClick={() => { onLangChange('es') }} className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${lang === 'es' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}>ES</button>
 </div>
 </div>
 <DialogTitle className="text-2xl font-semibold">Tu Commit ha sido generado</DialogTitle>
 <DialogDescription className="font-bold text-muted-foreground text-[11px]">Cópialo y úsalo en tu siguiente push</DialogDescription>
 </DialogHeader>
 <div className="p-8 space-y-6">
 <div className="relative group">
 <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-violet-500 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
 <div className="relative bg-[hsl(225,25%,8%)] p-6 rounded-xl font-mono text-sm border border-border/50 leading-relaxed shadow-inner">
 <span className="text-blue-400">$ git commit -m </span>
 <span className="text-emerald-400">"{commit}"</span>
 </div>
 </div>
 <Button onClick={onCopy} className={`w-full h-12 rounded-xl font-bold gap-3 transition-all duration-300 ${copied ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-primary shadow-lg shadow-primary/25'}`}>
 {copied ? <CheckCircle2 className="h-5 w-5" /> : <ClipboardCopy className="h-5 w-5" />}
 {copied ? '¡Copiado al Portapapeles!' : 'Copiar Comando de Git'}
 </Button>
 </div>
 </DialogContent>
 </Dialog>
 )
}
