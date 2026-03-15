import { NavLink, useLocation } from "react-router-dom"
import { 
  LayoutDashboard, 
  Settings, 
  FileText, 
  PanelLeftClose,
  PanelLeftOpen,
  Layers, 
  LogOut,
  Sun,
  Moon,
  BookOpen,
  CalendarDays,
  KanbanSquare,
  CheckSquare,
  Users,
  BarChart3,
  TrendingUp,
  Zap,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Target,
  ShieldCheck
} from "lucide-react"
import { cn } from "@/shared/utils"
import { useState, useEffect } from "react"
import { useAuthStore } from "@/features/auth/store"
import { useTheme } from "./theme-provider"
import { DataBackup } from "./data-backup"

interface NavItem {
  icon: React.ElementType
  label: string
  path?: string
  children?: {
    label: string
    path: string
    icon?: React.ElementType
  }[]
}

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: "VISTA GENERAL",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    ],
  },
  {
    title: "FLUJO DE TRABAJO",
    items: [
      { 
        icon: Target, 
        label: "Planificación", 
        children: [
          { label: "Épicas", path: "/epics", icon: Layers },
          { label: "Historias", path: "/stories", icon: BookOpen },
          { label: "Sprints", path: "/sprints", icon: CalendarDays },
        ] 
      },
      { 
        icon: ClipboardList, 
        label: "Operaciones", 
        children: [
          { label: "Tareas", path: "/tasks", icon: CheckSquare },
          { label: "Tablero Ágil", path: "/board", icon: KanbanSquare },
        ] 
      },
      { icon: FileText, label: "Editor Pro", path: "/editor" },
    ],
  },
  {
    title: "MÉTRICAS & CONTROL",
    items: [
      { 
        icon: BarChart3, 
        label: "Centro de Analítica", 
        path: "/analytics",
        children: [
          { label: "Salud del Proyecto", path: "/analytics/health", icon: ShieldCheck },
          { label: "Carga de Trabajo", path: "/analytics/load", icon: TrendingUp },
          { label: "Rendimiento Técnico", path: "/analytics/performance", icon: Zap },
        ] 
      },
    ],
  },
  {
    title: "CONFIGURACIÓN",
    items: [
      { icon: Users, label: "Gestión de Equipo", path: "/team" },
      { icon: Settings, label: "Plantillas Core", path: "/templates" },
    ],
  },
]


export function Sidebar() {
  const [open, setOpen] = useState(true)
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const { username, role, logout } = useAuthStore()
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"
  const location = useLocation()

  // Auto-expandir secciones si el path actual coincide
  useEffect(() => {
    let changed = false
    const newExpanded = { ...expandedItems }
    
    navSections.forEach(section => {
      section.items.forEach(item => {
        if (item.children?.some(child => location.pathname === child.path)) {
          if (!newExpanded[item.label]) {
            newExpanded[item.label] = true
            changed = true
          }
        }
      })
    })

    if (changed) {
      setExpandedItems(newExpanded)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const allowedPaths = ['/templates', '/editor']
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
    <aside
      className={cn(
        "flex flex-col h-screen shrink-0 overflow-hidden border-r shadow-sm transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)] z-50",
        open ? "w-[280px]" : "w-[80px]"
      )}
      style={{ backgroundColor: "#FFFFFF", borderColor: "#f1f5f9" }}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 h-[72px] px-6 shrink-0">
        <div className="grid place-items-center h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
          <Layers className="h-5 w-5 text-primary" />
        </div>
        {open && (
          <div className="flex flex-col leading-none overflow-hidden">
            <span className="text-[17px] font-black text-slate-900 tracking-tight truncate">
              BioTask<span className="text-primary italic">.</span>
            </span>
            <span className="text-[9px] font-black tracking-[.2em] text-slate-400 uppercase mt-0.5">
              Opsira Hub v5.0
            </span>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-4 space-y-8 custom-scrollbar">
        {filteredNavSections.map((section) => (
          <div key={section.title} className="space-y-2">
            {open && (
              <p className="px-3 mb-2 text-[10px] font-black text-slate-400 tracking-[.2em] select-none uppercase">
                {section.title}
              </p>
            )}

            <div className="space-y-1">
              {section.items.map((item) => {
                const isExpanded = expandedItems[item.label]
                const hasChildren = item.children && item.children.length > 0

                return (
                  <div key={item.label} className="space-y-1">
                    {item.path && !hasChildren ? (
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          cn(
                            "group relative flex items-center gap-3 rounded-xl text-[13px] font-bold transition-all duration-200 outline-none",
                            open ? "h-11 px-3" : "h-11 w-11 mx-auto justify-center",
                            isActive
                              ? "bg-primary/5 text-primary"
                              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                          )
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && open && (
                              <div className="absolute left-0 w-1 h-5 bg-primary rounded-r-full" />
                            )}
                            <item.icon
                              className={cn(
                                "shrink-0 transition-transform duration-200 group-hover:scale-110",
                                open ? "h-[18px] w-[18px]" : "h-5 w-5",
                                isActive ? "text-primary" : "text-slate-400"
                              )}
                            />
                            {open && <span className="truncate">{item.label}</span>}
                          </>
                        )}
                      </NavLink>
                    ) : (
                      <button
                        onClick={() => { toggleExpand(item.label) }}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-xl text-[13px] font-bold transition-all duration-200 outline-none w-full",
                          open ? "h-11 px-3" : "h-11 w-11 mx-auto justify-center",
                          isExpanded && open ? "bg-slate-50/50 text-slate-900" : "text-slate-500 hover:bg-slate-50"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "shrink-0 transition-transform duration-200 group-hover:scale-110",
                            open ? "h-[18px] w-[18px]" : "h-5 w-5",
                            isExpanded && open ? "text-primary" : "text-slate-400"
                          )}
                        />
                        {open && (
                          <>
                            <span className="truncate flex-1 text-left">{item.label}</span>
                            {isExpanded ? (
                              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                            )}
                          </>
                        )}
                      </button>
                    )}

                    {/* ── Sub Items ── */}
                    {hasChildren && isExpanded && open && (
                      <div className="pl-9 space-y-1 mt-1 animate-in slide-in-from-top-2 duration-200">
                        {item.children?.map((child) => (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            className={({ isActive }) =>
                              cn(
                                "flex items-center gap-3 h-9 px-3 rounded-lg text-[12px] font-medium transition-all duration-200",
                                isActive
                                  ? "text-primary bg-primary/5"
                                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                              )
                            }
                          >
                            {child.icon && (
                              <child.icon className="h-3.5 w-3.5 opacity-70" />
                            )}
                            <span className="truncate">{child.label}</span>
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* ── Theme & Tools ── */}
        <div className="space-y-2 pt-2 border-t border-slate-50">
          {open && (
            <p className="px-3 mb-2 text-[10px] font-black text-slate-400 tracking-[.2em] select-none uppercase">
              PREFERENCIAS
            </p>
          )}
          <button
            onClick={() => { setTheme(isDark ? "light" : "dark") }}
            className={cn(
              "flex items-center gap-3 rounded-xl text-[13px] font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 w-full outline-none",
              open ? "h-11 px-3" : "h-11 w-11 mx-auto justify-center"
            )}
          >
            {isDark ? (
              <Sun className={cn("shrink-0 text-slate-400", open ? "h-[18px] w-[18px]" : "h-5 w-5")} />
            ) : (
              <Moon className={cn("shrink-0 text-slate-400", open ? "h-[18px] w-[18px]" : "h-5 w-5")} />
            )}
            {open && (
              <span className="truncate">{isDark ? "Modo Claro" : "Modo Oscuro"}</span>
            )}
          </button>
        </div>
      </nav>

      {/* ── Footer ── */}
      <div className="shrink-0 p-4 space-y-4">
        <div
          className={cn(
            "flex items-center gap-3 rounded-2xl bg-slate-50 border border-slate-100 transition-all duration-300",
            open ? "p-3" : "p-2 justify-center"
          )}
        >
          <div className="relative shrink-0">
            <div
              className={cn(
                "grid place-items-center rounded-xl bg-white border border-slate-200 shadow-sm",
                open ? "h-10 w-10" : "h-9 w-9"
              )}
            >
              <span className="font-black text-primary text-sm uppercase">
                {username?.substring(0, 2).toUpperCase() || 'DU'}
              </span>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 block h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>

          {open && (
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-black text-slate-900 truncate capitalize">{username || 'Usuario'}</p>
              <p className="text-[10px] font-bold text-slate-400 truncate">{role || 'Conectado'}</p>
            </div>
          )}

          {open && (
            <div className="flex items-center gap-1">
              {role !== 'Editor' && <DataBackup />}
              <button
                onClick={() => { logout() }}
                className="grid place-items-center h-8 w-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50/50 transition-all duration-200"
                aria-label="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <button
          onClick={toggleCollapse}
          className="flex items-center justify-center gap-2 w-full rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200 h-10 border border-transparent hover:border-slate-100"
        >
          {open ? (
            <>
              <PanelLeftClose className="h-4 w-4 shrink-0" />
              <span className="text-[10px] font-black tracking-[.1em] uppercase">Colapsar</span>
            </>
          ) : (
            <PanelLeftOpen className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  )
}
