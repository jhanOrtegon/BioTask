import { 
 LayoutDashboard, 
 Settings, 
 Layers, 
 BookOpen,
 CalendarDays,
 KanbanSquare,
 CheckSquare,
 Users,
 BarChart3,
 TrendingUp,
 Target,
 ShieldCheck,
 Sparkles,
 Monitor,
 Activity,
 History,
 Terminal,
 Cpu,
} from "lucide-react"

export interface NavItem {
 icon: React.ElementType
 label: string
 path?: string
 children?: { 
 label: string
 path: string
 icon?: React.ElementType
 badge?: number 
 }[]
 badge?: number
}

export const navSections: { title: string; items: NavItem[] }[] = [
 {
 title: "OPERACIONES",
 items: [
 { icon: LayoutDashboard, label: "Panel Principal", path: "/" },
 { icon: Terminal, label: "Editor de Blueprints", path: "/editor" },
 { icon: KanbanSquare, label: "Tablero de Ejecución", path: "/board" },
 ],
 },
 {
 title: "INGENIERÍA",
 items: [
 { 
 icon: Target, 
 label: "Planificación", 
 children: [
 { label: "Épicas Principales", path: "/epics", icon: Layers },
 { label: "Historias de Usuario", path: "/stories", icon: BookOpen },
 { label: "Planificador Predictivo", path: "/planner", icon: Sparkles },
 { label: "Sprints Activos", path: "/sprints", icon: CalendarDays },
 ] 
 },
 { 
 icon: CheckSquare, 
 label: "Gestión Tareas", 
 path: "/tasks"
 },
 ],
 },
 {
 title: "INTELIGENCIA BIOTASK",
 items: [
 { 
 icon: Monitor, 
 label: "Monitoreo en Vivo", 
 children: [
 { label: "Pulso Operativo", path: "/monitoring/live", icon: Activity },
 { label: "Seguimiento Actividad", path: "/monitoring/activity", icon: History },
 ]
 },
 { 
 icon: Users, 
 label: "Gestión de Equipo", 
 path: "/team" 
 },
 { 
 icon: BarChart3, 
 label: "Centro de Analítica", 
 path: "/analytics",
 children: [
 { label: "Salud del Sistema", path: "/analytics/health", icon: ShieldCheck },
 { label: "Dinámica de Carga", path: "/analytics/load", icon: TrendingUp },
 { label: "Telemetría de Velocidad", path: "/analytics/performance", icon: Cpu },
 ] 
 },
 ],
 },
 {
 title: "GESTIÓN",
 items: [
 { icon: Settings, label: "Configuración", path: "/templates" },
 ],
 },
]
