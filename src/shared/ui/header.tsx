import { Layers } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { UserNav } from "./user-nav"
import { DataBackup } from "./data-backup"
import { Link } from "react-router-dom"

interface HeaderProps {
  showLogo?: boolean
}

export function Header({ showLogo = true }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          {showLogo && (
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Layers className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">BioTask Standard Edition</span>
            </Link>
          )}
        </div>
        <div className="flex items-center gap-4">
          <DataBackup />
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  )
}
