import { 
 FileText, 
 Search, 
 BookOpen, 
 Lightbulb, 
 Shield, 
 Sparkles,
 ArrowRight
} from 'lucide-react'
import { Input } from '@/shared/components/input'
import { Button } from '@/shared/components/button'
import { Card, CardContent } from '@/shared/components/card'
import { Badge } from '@/shared/components/badge'

const categories = [
 {
 title: "Estrategia de Negocio",
 icon: Lightbulb,
 articles: ["BioTask Blueprint 2026", "Vision: Inteligencia de Equipo", "KPIs y Métricas de Éxito"]
 },
 {
 title: "Operational Engine",
 icon: Sparkles,
 articles: ["Gestión de Sincronización Jira", "IA: Generación de Tareas", "Ciclos de Vida de Historias"]
 },
 {
 title: "Documentación Core",
 icon: BookOpen,
 articles: ["Protocolos de Git", "Arquitectura de Microservicios", "Standard de Estilos React"]
 },
 {
 title: "Seguridad y Setup",
 icon: Shield,
 articles: ["Criptografía de Datos", "Roles y Permisos", "Configuración de Entorno"]
 }
]

export default function WikiPage() {
 return (
 <div className="min-h-full bg-background p-4 md:p-6 lg:p-8 animate-in fade-in duration-700">
 <div className="max-w-7xl mx-auto space-y-12">
 
 {/* Hero Section */}
 <header className="relative py-20 rounded-2xl bg-secondary/5 border border-border/40 overflow-hidden group">
 <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5" />
 <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
 <BookOpen className="h-64 w-64 rotate-12" />
 </div>
 
 <div className="relative z-10 text-center space-y-8 max-w-3xl mx-auto px-6">
 <div className="space-y-4">
 <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
 Ops Protocols
 </h1>
 <p className="text-muted-foreground font-medium text-lg leading-relaxed">
 El repositorio central de conocimiento para la ejecución de alto rendimiento.
 Donde la ingeniería se encuentra con la excelencia operativa.
 </p>
 </div>

 <div className="relative max-w-xl mx-auto">
 <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
 <Input 
 placeholder="Buscar protocolos, guías o estándares..."
 className="h-12 pl-12 pr-6 rounded-lg bg-card border border-border/60 shadow-md text-base font-medium placeholder:font-medium focus:ring-1 focus:ring-primary/20 transition-all"
 />
 </div>
 </div>
 </header>

 {/* Featured Article */}
 <Card className="rounded-2xl border border-border/60 overflow-hidden shadow-lg group hover:border-primary/20 transition-all duration-500">
 <CardContent className="p-0">
 <div className="grid md:grid-cols-2">
 <div className="p-12 space-y-6">
 <Badge className="bg-primary text-primary-foreground font-semibold px-4 py-1.5 rounded-full text-xs tracking-wide">ESTRATEGIA CENTRAL</Badge>
 <h2 className="text-2xl font-bold leading-tight">BioTask Blueprint: Control Total e IA Integrada</h2>
 <p className="text-muted-foreground text-sm font-medium leading-relaxed">
 Nuestra visión 2026: Una capa inteligente sobre Jira que automatiza el desglose de tareas y ofrece predicciones en tiempo real sobre la salud del equipo.
 </p>
 <Button size="sm" className="rounded-lg gap-2 mt-4">
 Leer Protocolo <ArrowRight className="h-4 w-4" />
 </Button>
 </div>
 <div className="bg-secondary/10 relative overflow-hidden hidden md:block">
 <div className="absolute inset-0 flex items-center justify-center p-12">
 <Lightbulb className="h-48 w-48 text-primary/10 animate-pulse" />
 </div>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Categorías Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 {categories.map((cat, idx) => (
 <div key={idx} className="p-8 rounded-xl border-2 border-border/40 bg-card hover:border-primary/20 transition-all group">
 <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
 <cat.icon className="h-6 w-6" />
 </div>
 <h3 className="text-sm font-semibold text-foreground mb-4 group-hover:text-primary transition-colors">{cat.title}</h3>
 <ul className="space-y-3">
 {cat.articles.map((art, aIdx) => (
 <li key={aIdx}>
 <button className="text-[11px] font-bold text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all flex items-center gap-2">
 <div className="h-1 w-1 rounded-full bg-primary/40" />
 {art}
 </button>
 </li>
 ))}
 </ul>
 </div>
 ))}
 </div>

 {/* Recent & Contributions */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-8">
 <div className="lg:col-span-2 space-y-6">
 <h3 className="text-xs font-semibold text-muted-foreground/80 px-2">Recientemente Actualizado</h3>
 <div className="space-y-4">
 {[1, 2, 3].map((item) => (
 <div key={item} className="flex items-center gap-6 p-6 rounded-xl border border-border/40 bg-card hover:bg-secondary/5 transition-all cursor-pointer group">
 <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
 <FileText className="h-5 w-5" />
 </div>
 <div className="flex-1">
 <h4 className="text-sm font-bold">Guía de Despliegue en Entornos de Producción BioTask</h4>
 <p className="text-xs font-medium text-muted-foreground opacity-60">Actualizado hace 2 horas • Ingeniería</p>
 </div>
 <Badge variant="outline" className="text-xs font-semibold border-border/40 py-1">v4.2.0</Badge>
 </div>
 ))}
 </div>
 </div>

 <div className="space-y-6">
 <h3 className="text-xs font-semibold text-muted-foreground/80">Colaboradores Top</h3>
 <Card className="rounded-xl border-border/40 bg-card/20 backdrop-blur-sm">
 <CardContent className="p-8 space-y-6">
 {[1, 2].map(i => (
 <div key={i} className="flex items-center gap-4">
 <div className="h-10 w-10 rounded-full bg-muted border-2 border-background shadow-sm" />
 <div>
 <p className="text-sm font-semibold text-foreground">System Engineer-{i*42}</p>
 <p className="text-xs font-bold text-muted-foreground opacity-60">12 Artículos publicados</p>
 </div>
 </div>
 ))}
 </CardContent>
 </Card>
 </div>
 </div>
 </div>
 </div>
 )
}
