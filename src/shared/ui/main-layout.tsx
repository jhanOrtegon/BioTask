import { Sidebar } from "@/shared/ui/sidebar"
import { CommandPalette } from "@/shared/ui/command-palette"
import { Outlet } from "react-router-dom"

export function MainLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <CommandPalette />
    </div>
  )
}
