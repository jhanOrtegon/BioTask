import { Sidebar } from "@/shared/components/sidebar"
import { CommandPalette } from "@/shared/components/command-palette"
import { Outlet } from "react-router-dom"
import { Suspense } from "react"
import { LoadingScreen } from "./loading-screen"
import { LoadingTransition } from "./loading-transition"

export function MainLayout() {
 return (
 <div className="flex h-screen overflow-hidden bg-background">
 <Sidebar />
 <div className="flex flex-1 flex-col overflow-hidden">
 <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
 {/* 
 Usamos LoadingTransition para asegurar que el cargando se vea 
 siempre un instante (800ms) al navegar. 
 Suspense queda como respaldo para cargas reales lentas.
 */}
 <LoadingTransition>
 <Suspense fallback={<LoadingScreen />}>
 <Outlet />
 </Suspense>
 </LoadingTransition>
 </main>
 </div>
 <CommandPalette />
 </div>
 )
}
