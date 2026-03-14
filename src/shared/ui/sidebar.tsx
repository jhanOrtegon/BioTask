import { NavLink } from "react-router-dom"
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
  Users
} from "lucide-react"
import { cn } from "@/shared/utils"
import { useState } from "react"
import { useAuthStore } from "@/features/auth/store"
import { useTheme } from "./theme-provider"
import { DataBackup } from "./data-backup"

interface NavItem {
  icon: React.ElementType
  label: string
  path: string
}

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: "MENÚ",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/" },
      { icon: BookOpen, label: "Historias", path: "/stories" },
      { icon: CalendarDays, label: "Sprints", path: "/sprints" },
      { icon: CheckSquare, label: "Tareas", path: "/tasks" },
      { icon: KanbanSquare, label: "Tablero Ágil", path: "/board" },
      { icon: FileText, label: "Editor", path: "/editor" },
    ],
  },
  {
    title: "ADMIN",
    items: [
      { icon: Users, label: "Equipo", path: "/team" },
      { icon: Settings, label: "Plantillas", path: "/templates" },
    ],
  },
]

/* ──────────────────────────────────────────
   Paleta del sidebar: usa la misma familia 
   slate-225° del body, solo un nivel más oscuro
   ────────────────────────────────────────── */
const sb = {
  dark: {
    bg:     "#131722",   // Aclarado un poco (mantenido dark-slate)
    text:   "#8e95a8",
    muted:  "#545a6e",
    border: "#222736",
    hover:  "#222736",
    card:   "#1a1e2c",
  },
  light: {
    bg:     "#1b2030",   // Un poco más claro para la versión light
    text:   "#939ab0",
    muted:  "#5d647a",
    border: "#282e40",
    hover:  "#282e40",
    card:   "#212738",
  },
}

export function Sidebar() {
  const [open, setOpen] = useState(true)
  const { username, role, logout } = useAuthStore()
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"
  const c = isDark ? sb.dark : sb.light

  function toggleCollapse() {
    setOpen((v) => !v)
  }

  // Permisos según el rol
  const filteredNavSections = navSections.map(section => ({
    ...section,
    items: section.items.filter(item => {
      if (role === 'Editor') {
        const allowedPaths = ['/templates', '/editor']
        return allowedPaths.includes(item.path)
      }
      return true
    })
  })).filter(section => section.items.length > 0)

  return (
    <aside
      style={{ backgroundColor: c.bg, borderColor: c.border }}
      className={cn(
        "flex flex-col h-screen shrink-0 overflow-hidden border-r transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)]",
        open ? "w-[260px]" : "w-[72px]"
      )}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 h-[72px] px-5 shrink-0">
        <div className="grid place-items-center h-10 w-10 rounded-xl bg-primary/15 border border-primary/20 shrink-0">
          <Layers className="h-5 w-5 text-primary" />
        </div>
        {open && (
          <div className="flex flex-col leading-none overflow-hidden">
            <span className="text-[15px] font-extrabold text-white tracking-tight truncate">
              BioTask
            </span>
            <span style={{ color: c.muted }} className="text-[9px] font-semibold tracking-[.18em] uppercase mt-0.5">
              Standard Edition
            </span>
          </div>
        )}
      </div>

      {/* ── Separator ── */}
      <div className="mx-4 h-px" style={{ backgroundColor: c.border }} />

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-5 px-3 space-y-6">
        {filteredNavSections.map((section) => (
          <div key={section.title} className="space-y-1">
            {open && (
              <p style={{ color: c.muted }} className="px-3 mb-2 text-[10px] font-bold tracking-[.25em] select-none">
                {section.title}
              </p>
            )}

            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "relative flex items-center gap-3 rounded-lg text-[13px] font-semibold transition-all duration-200 outline-none",
                    open ? "h-11 px-3" : "h-11 w-11 mx-auto justify-center",
                    isActive
                      ? "bg-primary/12 text-white"
                      : "hover:text-white"
                  )
                }
                style={({ isActive }) => ({
                  color: isActive ? undefined : c.text,
                })}
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        "absolute left-0 w-[3px] rounded-r-full bg-primary transition-all duration-300",
                        isActive ? "h-5 opacity-100" : "h-0 opacity-0"
                      )}
                    />
                    <item.icon
                      className={cn(
                        "shrink-0 transition-colors duration-200",
                        open ? "h-[18px] w-[18px]" : "h-5 w-5",
                        isActive ? "text-primary" : ""
                      )}
                      style={{ color: isActive ? undefined : c.muted }}
                    />
                    {open && <span className="truncate">{item.label}</span>}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}

        {/* ── Theme toggle ── */}
        <div className="space-y-1">
          {open && (
            <p style={{ color: c.muted }} className="px-3 mb-2 text-[10px] font-bold tracking-[.25em] select-none">
              TEMA
            </p>
          )}
          <button
            onClick={() => { setTheme(isDark ? "light" : "dark") }}
            style={{ color: c.text }}
            className={cn(
              "relative flex items-center gap-3 rounded-lg text-[13px] font-semibold hover:text-white transition-all duration-200 w-full outline-none",
              open ? "h-11 px-3" : "h-11 w-11 mx-auto justify-center"
            )}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = c.hover }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent" }}
          >
            {isDark ? (
              <Sun className={cn("shrink-0", open ? "h-[18px] w-[18px]" : "h-5 w-5")} style={{ color: c.muted }} />
            ) : (
              <Moon className={cn("shrink-0", open ? "h-[18px] w-[18px]" : "h-5 w-5")} style={{ color: c.muted }} />
            )}
            {open && (
              <span className="truncate">{isDark ? "Modo Claro" : "Modo Oscuro"}</span>
            )}
          </button>
        </div>
      </nav>

      {/* ── Separator ── */}
      <div className="mx-4 h-px" style={{ backgroundColor: c.border }} />

      {/* ── Footer: user + collapse ── */}
      <div className="shrink-0 p-3 space-y-2">
        <div
          style={{ backgroundColor: c.card }}
          className={cn(
            "flex items-center gap-3 rounded-xl transition-all duration-200",
            open ? "p-3" : "p-2 justify-center"
          )}
        >
          <div className="relative shrink-0">
            <div
              className={cn(
                "grid place-items-center rounded-xl bg-primary/15 border border-primary/20",
                open ? "h-10 w-10" : "h-9 w-9"
              )}
            >
              <span className={cn("font-black text-primary/80", open ? "text-sm" : "text-xs uppercase")}>
                {username?.substring(0, 2).toUpperCase() || 'DU'}
              </span>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 block h-3 w-3 rounded-full bg-emerald-500 ring-2" style={{ borderColor: c.bg }} />
          </div>

          {open && (
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-white truncate capitalize">{username || 'Usuario'}</p>
              <p style={{ color: c.muted }} className="text-[10px] font-medium truncate">{role || 'Conectado'}</p>
            </div>
          )}

          {open && (
            <div className="flex items-center gap-0.5 shrink-0">
              {role !== 'Editor' && <DataBackup />}
              <button
                onClick={() => { logout() }}
                style={{ color: c.muted }}
                className="grid place-items-center h-8 w-8 rounded-lg hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 shrink-0"
                aria-label="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <button
          onClick={toggleCollapse}
          style={{ color: c.muted }}
          className="flex items-center justify-center gap-2 w-full rounded-lg hover:text-white transition-all duration-200 h-9"
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = c.hover }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent" }}
        >
          {open ? (
            <>
              <PanelLeftClose className="h-4 w-4 shrink-0" />
              <span className="text-[10px] font-bold tracking-widest uppercase">Minimizar</span>
            </>
          ) : (
            <PanelLeftOpen className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  )
}
