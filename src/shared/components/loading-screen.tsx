import { Layers } from 'lucide-react'

export function LoadingScreen() {
 return (
 <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/90 backdrop-blur-xl animate-in fade-in duration-500">
 <div className="relative flex items-center justify-center">
 {/* Orbit */}
 <div className="absolute h-24 w-24 animate-[spin_2.5s_linear_infinite] rounded-full border border-primary/15 border-t-primary/40" />
 
 {/* Core */}
 <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 animate-in zoom-in-90 duration-500">
 <Layers className="h-7 w-7 text-primary-foreground" />
 </div>
 </div>
 
 {/* Status */}
 <div className="mt-10 flex flex-col items-center space-y-2">
 <h2 className="text-lg font-bold tracking-tight text-foreground">
 BioTask
 </h2>
 <p className="text-[11px] font-medium text-muted-foreground animate-pulse">
 Cargando módulos...
 </p>
 </div>
 </div>
 )
}
