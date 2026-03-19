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
 <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
 <div className="container flex h-14 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
 <div className="flex items-center gap-2">
 {showLogo && (
 <Link to="/" className="flex items-center gap-2">
 <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
 <Layers className="h-3.5 w-3.5 text-primary-foreground" />
 </div>
 <span className="text-base font-bold tracking-tight">BioTask</span>
 </Link>
 )}
 </div>
 <div className="flex items-center gap-3">
 <DataBackup />
 <ThemeToggle />
 <UserNav />
 </div>
 </div>
 </header>
 )
}
