import { useState, useEffect } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { 
 PanelLeftClose,
 PanelLeftOpen,
 LogOut, 
 Sun,
 Moon,
 ChevronDown,
 Search,
 Activity,
 Layers
} from "lucide-react"
import { cn } from "@/shared/utils"
import { useAuthStore } from "@/features/auth/store"
import { useTheme } from "./theme-provider"
import { DataBackup } from "./data-backup"
import { 
 Tooltip, 
 TooltipContent, 
 TooltipProvider, 
 TooltipTrigger 
} from "@/shared/components/tooltip"
import { useStoriesStore } from "@/features/stories/store"
import { navSections } from "./sidebar-constants"
import type { NavItem } from "./sidebar-constants"



export function Sidebar() {
 const [open, setOpen] = useState(true)
 const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
 const { username, role, logout } = useAuthStore()
 const { theme, setTheme } = useTheme()
 const isDark = theme === "dark"
 const location = useLocation()
 const stories = useStoriesStore(state => state.stories)

 // Calcular badges dinámicos
 const pendingTasksCount = stories.reduce((acc, story) => 
 acc + story.tasks.filter(t => t.status === 'pending').length, 0
 )
 const activeStoriesCount = stories.filter(s => s.status === 'active').length

 // Auto-expandir secciones si el path actual coincide
 useEffect(() => {
 // eslint-disable-next-line react-hooks/set-state-in-effect
 setExpandedItems(prev => {
 const newExpanded = { ...prev }
 let hasChanged = false
 
 for (const section of navSections) {
 for (const item of section.items) {
 if (item.children?.some(child => location.pathname === child.path)) {
 if (!newExpanded[item.label]) {
 newExpanded[item.label] = true
 hasChanged = true
 }
 }
 }
 }

 return hasChanged ? newExpanded : prev
 })
 }, [location.pathname])

 function toggleCollapse() {
 setOpen((v) => !v)
 }

 function toggleExpand(label: string) {
 if (!open) {
 setOpen(true)
 setExpandedItems(prev => ({ ...prev, [label]: true }))
 return
 }
 setExpandedItems(prev => ({
 ...prev,
 [label]: !prev[label]
 }))
 }

 // Permisos según el rol
 const filterItem = (item: NavItem): NavItem | null => {
 if (role === 'Editor') {
 const allowedPaths = ['/templates', '/editor', '/tasks']
 if (item.path && allowedPaths.includes(item.path)) return item
 
 if (item.children) {
 const filteredChildren = item.children.filter(child => allowedPaths.includes(child.path))
 if (filteredChildren.length > 0) return { ...item, children: filteredChildren }
 }
 return null
 }
 return item
 }

 const filteredNavSections = navSections.map(section => ({
 ...section,
 items: section.items.map(filterItem).filter((i): i is NavItem => i !== null)
 })).filter(section => section.items.length > 0)

 return (
 <TooltipProvider delayDuration={0}>
 <aside
 className={cn(
 "flex flex-col h-screen shrink-0 overflow-hidden border-r border-border/60 transition-all duration-300 ease-out z-50 bg-card",
 open ? "w-[240px]" : "w-[68px]"
 )}
 >
 {/* ── Logo ── */}
 <div className="flex flex-col shrink-0">
 <NavLink 
 to="/" 
 className="flex items-center gap-3 h-[56px] px-4 group/logo transition-all"
 >
 <div className="grid place-items-center h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 shrink-0 group-hover/logo:bg-primary/15 transition-colors">
 <Layers className="h-4 w-4 text-primary" />
 </div>
 {open && (
 <div className="flex flex-col leading-none overflow-hidden flex-1">
 <span className="text-sm font-bold text-foreground tracking-tight">
 BioTask
 </span>
 <span className="text-xs font-medium text-muted-foreground/60 mt-0.5">
 Centro de Comando
 </span>
 </div>
 )}
 </NavLink>
 
 {/* ── Búsqueda Rápida ── */}
 {open && (
 <div className="px-3 mb-2">
 <div className="relative group">
 <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
 <input 
 type="text" 
 placeholder="Buscar..." 
 className="w-full bg-muted/40 border border-border/40 rounded-lg py-1.5 pl-8 pr-3 text-xs font-medium placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/30 transition-all"
 />
 </div>
 </div>
 )}
 </div>

 {/* ── Navegación ── */}
 <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-3 space-y-5">
 {filteredNavSections.map((section) => (
 <div key={section.title} className="space-y-0.5">
 {open && (
 <p className="px-2 mb-1.5 text-xs font-semibold text-muted-foreground/50 tracking-wider select-none uppercase">
 {section.title}
 </p>
 )}

 <div className="space-y-0.5">
 {section.items.map((item) => {
 const isExpanded = expandedItems[item.label]
 const hasChildren = item.children && item.children.length > 0
 const itemBadge = item.label === "Panel Principal" ? "LIVE" : null

 const NavContent = ({ isActive }: { isActive: boolean }) => (
 <>
 {isActive && open && (
 <div className="absolute left-0 w-[3px] h-4 bg-primary rounded-r-full" />
 )}
 {item.label === "Panel Principal" && (
 <div className="absolute top-1/2 -translate-y-1/2 left-2.5 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse pointer-events-none" />
 )}
 <item.icon
 className={cn(
 "shrink-0 transition-colors duration-200",
 open ? "h-4 w-4" : "h-[18px] w-[18px]",
 isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
 )}
 />
 {open && (
 <>
 <span className="truncate flex-1">{item.label}</span>
 {itemBadge && (
 <span className="text-xs font-semibold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15">
 {itemBadge}
 </span>
 )}
 </>
 )}
 </>
 )

 return (
 <div key={item.label} className="space-y-0.5">
 <Tooltip open={open ? false : undefined}>
 <TooltipTrigger asChild>
 <div onPointerDown={(e) => { e.preventDefault() }}>
 {item.path && !hasChildren ? (
 <NavLink
 to={item.path}
 className={({ isActive }) =>
 cn(
 "group relative flex items-center gap-2.5 rounded-lg text-[13px] font-medium transition-colors duration-200 outline-none",
 open ? "h-9 px-2.5" : "h-9 w-9 mx-auto justify-center",
 isActive
 ? "bg-primary/8 text-primary"
 : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
 )
 }
 >
 {({ isActive }) => <NavContent isActive={isActive} />}
 </NavLink>
 ) : (
 <button
 onClick={() => { toggleExpand(item.label) }}
 onPointerDown={(e) => { e.preventDefault() }}
 className={cn(
 "group relative flex items-center gap-2.5 rounded-lg text-[13px] font-medium transition-colors duration-200 outline-none w-full",
 open ? "h-9 px-2.5" : "h-9 w-9 mx-auto justify-center",
 isExpanded && open ? "bg-muted/50 text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
 )}
 >
 <item.icon
 className={cn(
 "shrink-0 transition-colors duration-200",
 open ? "h-4 w-4" : "h-[18px] w-[18px]",
 isExpanded && open ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
 )}
 />
 {open && (
 <>
 <span className="truncate flex-1 text-left">{item.label}</span>
 <ChevronDown className={cn(
 "h-3.5 w-3.5 text-muted-foreground/50 transition-transform duration-200",
 isExpanded ? "rotate-0" : "-rotate-90"
 )} />
 </>
 )}
 </button>
 )}
 </div>
 </TooltipTrigger>
 {!open && (
 <TooltipContent side="right" className="font-medium text-xs">
 {item.label}
 </TooltipContent>
 )}
 </Tooltip>

 {/* ── Sub Items ── */}
 {hasChildren && isExpanded && open && (
 <div className="pl-4 space-y-0.5 mt-0.5 border-l border-border/40 ml-4">
 {item.children?.map((child) => {
 const childBadge = child.label === "Gestión de Tareas" ? pendingTasksCount : 
 child.label === "Historias de Usuario" ? activeStoriesCount : null

 return (
 <NavLink
 key={child.path}
 to={child.path}
 className={({ isActive }) =>
 cn(
 "flex items-center gap-2 h-8 px-2.5 rounded-lg text-[12px] font-medium transition-colors duration-200 relative group/sub",
 isActive
 ? "text-primary bg-primary/5"
 : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
 )
 }
 >
 {child.icon && (
 <child.icon className="h-3.5 w-3.5 opacity-50 group-hover/sub:opacity-80 transition-opacity" />
 )}
 <span className="truncate flex-1">{child.label}</span>
 {childBadge && childBadge > 0 && (
 <span className="text-xs font-medium bg-muted/60 px-1.5 py-0.5 rounded-md text-muted-foreground min-w-[18px] text-center">
 {childBadge}
 </span>
 )}
 </NavLink>
 )
 })}
 </div>
 )}
 </div>
 )
 })}
 </div>
 </div>
 ))}

 {/* ── Tema ── */}
 <div className="space-y-0.5 pt-2 border-t border-border/40">
 {open && (
 <p className="px-2 mb-1.5 text-xs font-semibold text-muted-foreground/50 tracking-wider select-none uppercase">
 Preferencias
 </p>
 )}
 <Tooltip open={open ? false : undefined}>
 <TooltipTrigger asChild>
 <button
 onClick={() => { setTheme(isDark ? "light" : "dark") }}
 onPointerDown={(e) => { e.preventDefault() }}
 className={cn(
 "flex items-center gap-2.5 rounded-lg text-[13px] font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors duration-200 w-full outline-none",
 open ? "h-9 px-2.5" : "h-9 w-9 mx-auto justify-center"
 )}
 >
 {isDark ? (
 <Sun className={cn("shrink-0", open ? "h-4 w-4" : "h-[18px] w-[18px]")} />
 ) : (
 <Moon className={cn("shrink-0", open ? "h-4 w-4" : "h-[18px] w-[18px]")} />
 )}
 {open && (
 <span className="truncate">{isDark ? "Modo Claro" : "Modo Oscuro"}</span>
 )}
 </button>
 </TooltipTrigger>
 {!open && (
 <TooltipContent side="right" className="font-medium text-xs">
 Cambiar Tema
 </TooltipContent>
 )}
 </Tooltip>
 </div>
 </nav>

 {/* ── Footer ── */}
 <div className="shrink-0 p-3 space-y-2">
 <div
 className={cn(
 "flex items-center gap-2.5 rounded-xl bg-muted/40 border border-border/40 transition-all duration-300 overflow-hidden",
 open ? "p-2.5" : "p-2 justify-center"
 )}
 >
 <div className="relative shrink-0">
 <div
 className={cn(
 "grid place-items-center rounded-lg bg-background border border-border/60",
 open ? "h-9 w-9" : "h-8 w-8"
 )}
 >
 <span className="font-bold text-primary text-xs uppercase">
 {username?.substring(0, 2).toUpperCase() || 'DU'}
 </span>
 </div>
 <span className="absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
 </div>

 {open && (
 <div className="flex-1 min-w-0">
 <p className="text-[13px] font-semibold text-foreground truncate capitalize">{username || 'Usuario'}</p>
 <div className="flex items-center gap-1 overflow-hidden">
 <Activity className="h-2 w-2 text-emerald-500 animate-pulse" />
 <p className="text-xs font-medium text-muted-foreground truncate">{role || 'Conectado'}</p>
 </div>
 </div>
 )}

 {open && (
 <div className="flex items-center gap-1">
 {role !== 'Editor' && <DataBackup />}
 <button
 onClick={() => { logout() }}
 className="grid place-items-center h-7 w-7 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
 aria-label="Cerrar sesión"
 >
 <LogOut className="h-3.5 w-3.5" />
 </button>
 </div>
 )}
 </div>

 <button
 onClick={toggleCollapse}
 className="flex items-center justify-center gap-2 w-full rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors duration-200 h-8"
 >
 {open ? (
 <>
 <PanelLeftClose className="h-3.5 w-3.5 shrink-0" />
 <span className="text-[11px] font-medium">Colapsar</span>
 </>
 ) : (
 <PanelLeftOpen className="h-4 w-4" />
 )}
 </button>
 </div>
 </aside>
 </TooltipProvider>
 )
}
